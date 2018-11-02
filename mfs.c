//FAT32 file system (file allocation table)
//how files are stored

#define _GNU_SOURCE

#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h>
#include <signal.h>
#include <stdint.h>
#include <ctype.h>





#define WHITESPACE " \t\n"      // We want to split our command line up into tokens
                                // so we need to define what delimits our tokens.
                                // In this case  white space
                                // will separate the tokens on our command line

#define MAX_COMMAND_SIZE 255    // The maximum command-line size

#define MAX_NUM_ARGUMENTS 5     // Mav shell only supports five arguments
#define BPB_BytsPerSec_Offset 11
#define BPB_BytsPerSec_Size 2

#define BPB_SecPerClus_Offset 13
#define BPB_SecPerClus_Size 1

#define BPB_RsvdSecCnt_Offset 14
#define BPB_RsvdSecCnt_Size 2

#define BPB_NumFATS_Offset 16
#define BPB_NumFATS_Size 2

#define BPB_RootEntCnt_Offset 17
#define BPB_RootEntCnt_Size 2

#define BPB_FATSz32_Offset 36
#define BPB_FATSz32_Size 4

#define BS_VolLab_Offset 36
#define BS_VolLab_Size 11

FILE *fp;
int file_open = 0;


//fat32 layout, storing vars
int16_t   BPB_BytsPerSec;
int8_t    BPB_SecPerClus;
int16_t   BPB_RsvdSecCnt;
int8_t    BPB_NumFATS;
int16_t   BPB_RootEntCnt;
char      BS_VolLab[11];
int32_t   BPB_FATSz32;
int32_t   BPB_RootClus;

int32_t   RootDirSectors =0;
int32_t   FirstDataSector =0;
int32_t   FirstSectorofCluster=0;


struct __attribute__((__packed__)) DirectoryEntry
{
    char DIR_NAME[11];
    uint8_t DIR_Attr;
    u_int8_t Unused1[8];
    u_int16_t DIR_FirstClusterHigh;
    u_int8_t Unused2[4];
    uint16_t DIR_FirstClusterLow;
    uint32_t DIR_FileSize;
};
struct DirectoryEntry dir[16];

int rootDir=0;
int curDir=0;
int i;


int main()
{

  char * cmd_str = (char*) malloc( MAX_COMMAND_SIZE );
  int root_clus_Address;

  while( 1 )
  {
    // Print out the msh prompt
    printf ("msh> ");

    // Read the command from the commandline.  The
    // maximum command that will be read is MAX_COMMAND_SIZE
    // This while command will wait here until the user
    // inputs something since fgets returns NULL when there
    // is no input
    while( !fgets (cmd_str, MAX_COMMAND_SIZE, stdin) );

    /* Parse input */
    char *token[MAX_NUM_ARGUMENTS];

    int   token_count = 0;                                 
                                                           
    // Pointer to point to the token
    // parsed by strsep
    char *arg_ptr;                                         
                                                           
    char *working_str  = strdup( cmd_str );                

    // we are going to move the working_str pointer so
    // keep track of its original value so we can deallocate
    // the correct amount at the end
    char *working_root = working_str;

    // Tokenize the input stringswith whitespace used as the delimiter
    while ( ( (arg_ptr = strsep(&working_str, WHITESPACE ) ) != NULL) && 
              (token_count<MAX_NUM_ARGUMENTS))
    {
      token[token_count] = strndup( arg_ptr, MAX_COMMAND_SIZE );
      if( strlen( token[token_count] ) == 0 )
      {
        token[token_count] = NULL;
      }
        token_count++;
    }

    // Now print the tokenized input as a debug check
    // \TODO Remove this code and replace with your shell functionality

    // int token_index  = 0;
    // for( token_index = 0; token_index < token_count; token_index ++ ) 
    // {
    //   printf("token[%d] = %s\n", token_index, token[token_index] );  
    // }
    //opens the file system if the input is open
    if(token[0] == NULL) //continue if press enter
    {
        continue;
    }
    if(strcasecmp(token[0],"quit")==0 || strcasecmp(token[0],"exit")==0)
    {
      exit(0);
    }
    if(strcasecmp(token[0],"open") == 0) //opening file fat32.img
    {
	     if(token[1]==NULL)
	     {
		        printf("Error: File system image not found.\n");
		          continue;
	     }
	     if(file_open == 1)
	     {
		         printf("Error: File system image already open.\n");
		         continue;
	     }

	      fp = fopen(token[1],"r");
        if(fp==NULL)
        {
            printf("Error: File system image not found.\n");
        }
        else
        {
          //fread paramters are:
          //1: where is my dest
          //2: size of item i want to read
          //3: num of items i want to read
          file_open = 1;

          fseek(fp, 11, SEEK_SET); 
          fread(&BPB_BytsPerSec,2 ,1, fp); //bytes per sector

          fseek(fp, 13, SEEK_SET);
		      fread(&BPB_SecPerClus,1,1,fp); //sector per cluster

          fseek(fp, 14, SEEK_SET);
		      fread(&BPB_RsvdSecCnt,1,2,fp); //reserved sector

          fseek(fp, 16, SEEK_SET);
          fread(&BPB_NumFATS, 1, 1, fp); //num of FATS

          fseek(fp, 36, SEEK_SET);
          fread(&BPB_FATSz32, 1, 4, fp);

          //BPB_RootEntCnt
          fseek(fp, BPB_RootEntCnt_Offset, SEEK_SET);
          fread(&BPB_RootEntCnt, BPB_RootEntCnt_Size, 1, fp);

          //BS_VolLab
          fseek(fp, BS_VolLab_Offset, SEEK_SET);
          fread(&BS_VolLab, BS_VolLab_Size, 1 , fp);


          //update the root offset
          root_clus_Address = (BPB_NumFATS * BPB_FATSz32 * BPB_BytsPerSec) + (BPB_RsvdSecCnt * BPB_BytsPerSec);
          //printf("offset is not %d\n", root_clus_Address);

          //calculating address of root directory
          rootDir = (BPB_NumFATS * BPB_FATSz32 * BPB_BytsPerSec)+(BPB_RsvdSecCnt * BPB_BytsPerSec);
          //printf("%x\n", root_clus_Address);
          curDir = rootDir;
          //allocating 32 bytes of struct 
          fseek(fp, rootDir, SEEK_SET);          
          
          int i;
          for (i = 0; i < 16; i++)
          {
            fread(&dir[i], sizeof(struct DirectoryEntry),1, fp);
          }

          // for(i=0; i < 16; i++)
          // {
          //   printf("%s\n", dir[i].DIR_NAME);
          // }
        }
    }


    if(strcasecmp(token[0],"close")==0) //if closing file
    {
      if(file_open == 0) //if file already close
      {
        printf("Error: File system not open.\n");
      }
      else
      {
        file_open = 0; //close the file
        fclose(fp);
        fp = NULL;
      }
    }
    if(strcasecmp(token[0],"info")==0) //printing info
    {
      printf("BPB_BytsPerSec: %d %x\n", BPB_BytsPerSec, BPB_BytsPerSec);
      printf("BPB_SecPerClus: %d %x\n", BPB_SecPerClus, BPB_SecPerClus);
      printf("BPB_RsvdSecCnt: %d %x\n", BPB_RsvdSecCnt, BPB_RsvdSecCnt);
      printf("   BPB_NumFATS: %d %x\n", BPB_NumFATS, BPB_NumFATS);
      printf("   BPB_FATSz32: %d %x\n", BPB_FATSz32, BPB_FATSz32);
    }

    //stat should give you info about the file
    //what attribute value it is
    //what the size is 
    //and what the starting cluster is
    //refer to prof video at 9:00
    if (strcasecmp(token[0], "stat") == 0) //needs to print for a specefic given file
    {
      //printf("inside stat\n");
      //this is not done
      //this will have to change with more if statements
      int i;
      //fseek(fp, curDir, SEEK_SET);

      for (int i = 0; i < 16; i++)
      {
        char name[12]; //adding a null terminate to end of file names
        memcpy(name, dir[i].DIR_NAME, 11);
        name[11] = '\0';

        //were gonna make a new char and give it the new name
        //this will be the name we will compare to show stats
        char new_name[12];

        int j;
        int g = 0;
        for (j = 0; j < 11; j++)
        {
          if (name[j] != ' ')
          {
            new_name[g] = name[j];
            // printf("%c", new_name[g]);
            g++;
            new_name[g] = '\0';
          }
        }
        // printf("\n");
        //Leave this here so we can see all the real names
        // printf("new name is %s\n", new_name);

        if (strcasecmp(token[1], new_name) == 0)
        {
          {

            printf("\n%.11s\n", dir[i].DIR_NAME);
            printf(" Attr is: %d\n", dir[i].DIR_Attr);
            printf("File size is:%d\n", dir[i].DIR_FileSize);
            printf(" Starting Cluster Number is:%d\n\n", dir[i].DIR_FirstClusterLow);
          }
        }
      }
    }
    if(strcasecmp(token[0],"get")==0)
    {
      //if stat is done
    }
    if(strcasecmp(token[0],"ls")==0)
    {
      if (fp != NULL)
      {
        
        for (i = 0; i < 16; i++)
        {
          if(dir[i].DIR_Attr == 0x01 || dir[i].DIR_Attr == 0x10 || dir[i].DIR_Attr == 0x20) //bascially print the acutal files not the junk with it (the delted files or nulls)
          {
            char name[12]; //adding a null terminate to end of file names
            memcpy(name, dir[i].DIR_NAME, 11);
            name[11] = '\0';
            printf("%.11s\n", name);

          }
        }
      }
    }
    if(strcasecmp(token[0],"cd")==0)
    {

    }
    free( working_root );

  }
  return 0;
}
