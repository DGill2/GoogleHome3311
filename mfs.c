#define _GNU_SOURCE

#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h>
#include <signal.h>

#define WHITESPACE " \t\n"      // We want to split our command line up into tokens
                                // so we need to define what delimits our tokens.
                                // In this case  white space
                                // will separate the tokens on our command line

#define MAX_COMMAND_SIZE 255    // The maximum command-line size

#define MAX_NUM_ARGUMENTS 5     // Mav shell only supports five arguments
FILE *fp;
int file_open = 0;


//fat32 layout
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

int main()
{

  char * cmd_str = (char*) malloc( MAX_COMMAND_SIZE );

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
          file_open = 1;

          fseek(fp, 11, SEEK_SET); 
          fread(&BPB_BytsPerSec,2 ,1, fp); //bytes per sector

          fseek(fp, 13, SEEK_SET);
		      fread(&BPB_SecPerClus,1,1,fp);

          fseek(fp, 14, SEEK_SET);
		      fread(&BPB_RsvdSecCnt,1,2,fp);
        }
    }

    if((strcasecmp(token[0],"close"))==0) //if closing file
    {
      if(file_open == 0) //if file already close
      {
        printf("Error: File system not open.\n");
      }
      else
      {
        file_open = 0; //close the file
        fclose(fp);

      }
    }
    free( working_root );

  }
  return 0;
}