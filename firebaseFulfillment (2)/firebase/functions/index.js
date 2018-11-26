
const functions = require('firebase-functions');
const {
  dialogflow,
  Permission,
  Suggestions,
} = require('actions-on-google');
const functionss = require('firebase-functions');

const FALLBACK_INTENT = 'Default Fallback Intent';
const WELCOME_INTENT = 'Default Welcome Intent';
//const WORKOUT_PLAN_INTENT = 'workout plan recommendation';
//const CHOICE_PLAN_ENTITY = 'UsersChoicePlan';
const AGE_ENTITY = 'UsersAge';
const AGE_INTENT = 'Age';
const HEIGHT_INTENT = 'height';
const WEIGHT_INTENT = 'weight';
const CALORIES_INTENT = 'caloriesIntake';
const PLACE_INTENT = 'place';
const GENDER_INTENT = 'gender';
const HEAR_INTENT = 'hear';
const EMAIL_INTENT = 'email'
var firstNumber;


const length_val = 'unit-length';
const app = dialogflow({debug: true});

//setting the var global to access in other functions
var w_num; //weight 
var feet;  //height vars 
var inches=0;
var cm;
var place;

var mon, wed, fri;

var nodemailer = require('nodemailer');
const SMTPConnection = require('nodemailer/lib/smtp-connection');
let connection = new SMTPConnection(465);
//var smtpTransport = require('nodemailer-smtp-transport');

const sgMail = require('@sendgrid/mail');
process.env.SENDGRID_API_KEY = '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'


app.intent('workout plan recommendation', (conv, params, UsersChoicePlan) => {
    
    //var r = /\d+/;
    //conv.data.planChoice=  UsersChoicePlan.match(r);
    conv.data.planChoice = UsersChoicePlan
    console.log(conv.data.planChoice);
    conv.ask('Excellent choice. before we get started, I would like to get to know you better. First off ' + 
                'you can start by telling me your gender. Are you male or female?');

});

app.intent(GENDER_INTENT, (conv, params, genders)=>{
  //r stands for regular expression
  //var r = /\d+/;
  
  //conv.data.sex = genders.match(r);
  
  conv.data.sex = genders;
  console.log(conv.data.sex);
  
  //var num = parseFloat(conv.data.age);
  
  if(conv.data.sex.endsWith('male') || conv.data.sex.endsWith('man')|| conv.data.sex.endsWith('guy') || conv.data.sex.endsWith('father')|| conv.data.sex.endsWith('mail'))
  {
    console.log(" in male if statement");
    conv.user.storage.sex = 'male';  
    conv.ask('Great!. what is your age?');
  }
  else if(conv.data.sex.endsWith('female') || conv.data.sex.endsWith('girl') || conv.data.sex.endsWith('mother'))
  {
    console.log(" in female if statement");
    conv.user.storage.sex = 'female';  
    conv.ask('Great!. what is your age?');
  }
  else
  {
    conv.close("Sorry, I have trouble understanding your gender. Could you repeat it again?");
  }
  
});

app.intent(AGE_INTENT, (conv, params, age)=>{ 
  //r stands for regular expression
  var r = /\d+/;
  conv.data.age = age.match(r);
  var num = parseFloat(conv.data.age);
  
  if(num >= 18.0)
  {
    conv.ask('i see your age is ' + num + ' years old. ');  
    conv.ask('All right, what is your current weight?');
  }
  else
  {
    conv.close("Sorry, but you are not old enough to use this application, Goodbye!");
  }
  
});



//now weight works with floating point number
app.intent(WEIGHT_INTENT, (conv, params, unitWeight) =>{ 
    var r_w = /\d+/;
    //conv.data.unitWeight = unitWeight.match(r_w);
    
    //w_num = parseInt(conv.data.unitWeight);
    //console.log(conv.data.unitWeight);
    //console.log(unitWeight);
    
    //var start = unitWeight.indexOf("lbs"); //correct answer is 4
    
    if(unitWeight.endsWith("lbs") || unitWeight.endsWith("pounds") || unitWeight.endsWith("lb")){
        conv.data.weight_lbs = unitWeight.match(r_w);
        
        //convert lbs to kg by dividing 2.2
        conv.data.weight_kg = parseFloat(conv.data.weight_lbs) / (2.2);
        conv.ask('weight is '+ conv.data.weight_lbs + ' pounds. Awesome! what is your height?');
    }
    else if(unitWeight.endsWith("kg") || unitWeight.endsWith("kilograms")){
        conv.data.weight_kg = unitWeight.match(r_w);
        conv.data.weight_kg = parseFloat(conv.data.weight_kg);
        conv.ask('weight is '+ conv.data.weight_kg + ' kilograms. Awesome! what is your height?');
    }
    else{
        conv.ask('I did not get it. Could you tell me your weight again?');
    }
    
});

//shuffle the contents in an array
function shuffle(originalArray) {
  var array = [].concat(originalArray);
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

app.intent(HEIGHT_INTENT, (conv, params, heightRange) => {
    
    // var i;
    // var workOuts = ["pushups", "situps", "cardio", "curls"];
    // console.log("in height");
    // var newArray = shuffle(workOuts);
    // for(i=0; i < 4; i++)
    // console.log('new Randomized array ', newArray[i]);
    
    var r_h = /\d+/g;
    
    h_array = heightRange.match(r_h);
    
    //conv.data.heightRange = heightRange.match(r_h);
  //var height =  parseInt(conv.data.heightRange);
    
    if(heightRange.endsWith("feet") || heightRange.endsWith("ft"))
    {
        conv.data.h_feet = h_array[0];
        //convert feet to Meter by multiplying by 0.0254
        conv.data.h_meters = parseFloat(h_array[0]) * 0.0254;
    
        conv.ask('you are '+ conv.data.h_feet + ' tall. Next, Where do you plan to workout? is it going to be at home or at a gym??');
    
        console.log(workOuts.shuffle());
    }
    else if(heightRange.endsWith("inches") || heightRange.endsWith("inch") || heightRange.endsWith("in"))
    {
        
        conv.data.h_f = parseFloat(h_array[0]);
        conv.data.h_i = parseFloat(h_array[1]);
        
        
        //convert feet to inches
        conv.data.h_feet = parseFloat(h_array[0]) * 12;
        
        //add remaining inches together
        conv.data.h_inches = parseFloat(h_array[1]) + conv.data.h_feet;
        
        //convert result inches into meters
        conv.data.h_meters = (conv.data.h_inches) * 0.0254;
        
        
        //feet = parseFloat(conv.data.h_feet);
        //inches = parseFloat(conv.data.h_inches);
        
        conv.ask('you are '+ conv.data.h_f + ' feet ' + conv.data.h_i + ' inches tall. Next, where do you plan to workout? is it going to be at home or at a gym?');
    }
    else if(heightRange.endsWith("centimeters") || heightRange.endsWith("cm"))
    {
        
        conv.data.h_cm = h_array[0];
        
        //take data as centimeters and convert it to meters
        conv.data.h_meters = parseFloat(h_array[0]) * 100;
        
        //cm = conv.data.h_cm;
        conv.ask('you are '+ conv.data.h_cm + ' centimeters tall.  Next,  Where do you plan to workout? is it going to be at home or at a gym??');
    }
    else
    {
        conv.ask('Sorry I did not get what you mean. Could you tell me your height again in feet or in centimeters?');
    }
    
});


app.intent(PLACE_INTENT, (conv, params, places)=>{
   //r stands for regular expression
  console.log('I am in place intent');
  var r = /\d+/;
  //conv.data.place = places.match(r);
  
  place = places;
  //console.log("place is" + place);
  //calculate BMI value by calling BMI function
  var BMI_val = Cal_BMI(conv.data.weight_kg, conv.data.h_meters);
  //console.log(BMI_val);
  conv.data.BMI = BMI_val;
  
  
    if(conv.user.storage.sex === 'female'){
        conv.data.sexNum = 0;
        //console.log("i am in female call");
    }
    else{
        conv.data.sexNum = 1;
         //console.log("i am in male call");
    }
    
  var fatPercentage = Fat_percent(conv.data.BMI, conv.data.sexNum, conv.data.age);
  console.log("Fat Percentage is: " + fatPercentage);
      
      
  //sexNum determines if the user is male or female
  // Female is 0 and Male is 1
  if(conv.data.sexNum === 0)
  {
    if(fatPercentage >= 10.0 && fatPercentage <= 13.9 )
    {
        conv.ask('According to my calculation, your BMI is '+  conv.data.BMI + '. Your fat percentage is ' + fatPercentage + '. It seems that you fall under extremely fit category. According to my research, you should first focus more on your diet ');
    }
    else if(fatPercentage >= 14.0  && fatPercentage <= 20.9)
    {
        conv.ask('<speak> According to my calculation, your BMI is '+  conv.data.BMI +  '. Your fat percentage is ' + fatPercentage + '. It seems that you fall under athletes category.' + 
        ' Please wait a moment while I\'m generating a workout plan for you. <break time="3" /> Okay, Your workout plan has been generated. Would you like to hear it now or would you want me to email it to your Google Email? </speak> '  );
    }
    else if(fatPercentage >= 21.0  && fatPercentage <= 24.9)
    {
        conv.ask('<speak> According to my calculation, your BMI is '+  conv.data.BMI +  '. Your fat percentage is ' + fatPercentage + '. It seems that you fall under fit category.' + 
        ' Please wait a moment while I\'m generating a workout plan for you. <break time="5" /> Okay, Your workout plan has been generated. Would you like to hear it now or would you like me to email it to your Google Email? </speak> '  );
    }
    else if(fatPercentage >= 25.0 && fatPercentage <= 31.9 )
    {
        conv.ask('<speak> According to my calculation, your BMI is '+  conv.data.BMI +  '. Your fat percentage is ' + fatPercentage + '. It seems that you fall under average category.' + 
        ' Please wait a moment while I\'m generating a workout plan for you. <break time="3" /> Okay, Your workout plan has been generated. Would you like to hear it now or would you want me to email it to your Google Email? </speak> '  );
    }
    else if(fatPercentage >= 32)
    {
        conv.ask('<speak> According to my calculation, your BMI is '+  conv.data.BMI +  '. Your fat percentage is ' + fatPercentage + '. It seems that you fall under overweight category.' + 
        ' Please wait a moment while I\'m generating a workout plan for you. <break time="3" /> Okay, Your workout plan has been generated. Would you like to hear it now or would you want me to email it to your Google Email? </speak> '  );
    }
    else
    {
        conv.close("I am unable to calculate your fat percentage, check back with us later");
    }
  }
  
  if(conv.data.sexNum === 1)
  {
    if(fatPercentage >= 2.0 && fatPercentage <= 5.9 )
    {
        conv.ask('According to my calculation, your BMI is '+  conv.data.BMI +  '. Your fat percentage is ' + fatPercentage + '. It seems that you fall under extremely fit category. According to my research, you should first focus more on your diet ');
    }
    else if(fatPercentage >= 6.0  && fatPercentage <= 13.9)
    {
        conv.ask('<speak> According to my calculation, your BMI is '+  conv.data.BMI +  '. Your fat percentage is ' + fatPercentage + '. It seems that you fall under athletes category.' + 
        ' Please wait a moment while I\'m generating a workout plan for you. <break time="3" /> Okay, Your workout plan has been generated. Would you like to hear it now or would you want me to email it to your Google Email? </speak> '  );
    }
    else if(fatPercentage >= 14.0  && fatPercentage <= 17.9)
    {
       conv.ask('<speak> According to my calculation, your BMI is '+  conv.data.BMI +  '. Your fat percentage is ' + fatPercentage + '. It seems that you fall under fit category.' + 
        ' Please wait a moment while I\'m generating a workout plan for you. <break time="3" /> Okay, Your workout plan has been generated. Would you like to hear it now or would you want me to email it to your Google Email? </speak> '  );
    }
    else if(fatPercentage >= 18.0 && fatPercentage <= 24.9 )
    {
       conv.ask('<speak> According to my calculation, your BMI is '+  conv.data.BMI +  '. Your fat percentage is ' + fatPercentage + '. It seems that you fall under average category.' + 
        ' Please wait a moment while I\'m generating a workout plan for you. <break time="3" /> Okay, Your workout plan has been generated. Would you like to hear it now or would you want me to email it to your Google Email? </speak> '  );
    }
    else if(fatPercentage >= 25)
    {
        conv.ask('<speak> According to my calculation, your BMI is '+  conv.data.BMI +  '. Your fat percentage is ' + fatPercentage + '. It seems that you fall under overweight category.' + 
        ' Please wait a moment while I\'m generating a workout plan for you. <break time="3" /> Okay, Your workout plan has been generated. Would you like to hear it now or would you want me to email it to your Google Email? </speak> '  );
    }
    else
    {
        conv.close("I am unable to calculate your fat percentage, check back with us later");
    }
    
  }
  
  //clear user data the storage. Storage property persists across multiple sessions 
  //conv.user.storage = {};
});

//////////////////////////////////////////////////////////////////
app.intent(HEAR_INTENT, (conv, params, hearOption)=>{
  conv.data.option = hearOption;
  console.log("this is the option: " + conv.data.option);
  console.log("this is the plan: " + conv.data.planChoice);
  console.log("this is the place: "+ place);
  
  if(conv.data.option.endsWith("now") || conv.data.option.endsWith("hear it") || conv.data.option.endsWith("tell me"))
  {
    if(place === 'home')
    {
        if(conv.data.planChoice === 'Lose Weight' || conv.data.planChoice === 'lose weight')
        {
            var beginnerWorkouts = ["Inchworm", "Power Skip", "Uppercut", "Mountain Climber Twist", "High Knees", "Punch", "Plank Jacks", "Butt Kick", "Fast Feet Shuffle",
            "Plank-to-Knee Tap", "Jumping Jack", "Vertical Jump", "Skaters", "Long Jump With Jog Back", "Tuck Jump", "Corkscrew", "Diver's Push-Up", "Wide Mountain Climbers",
            "Invisible Jump Rope", "3 Hops to Push-Up", "Step-Up", "Classic Burpee", "Single-Leg Hop", "Runner's Skip", "Flutter Kick", "Sprinter Sit-Ups", "Squat Jump", "Plyometric Push-Up",
            "Tricep Push-Up With Mountain Climber", "Box Jump", "Donky Kick", "Lateral Jump", "Jumping Lunges"];
            
         
            var workout = shuffle(beginnerWorkouts);
            
            //console.log("I am outside of for loop");
            var monday = [];
            for (let index = 0; index < 11; index++)
            {
                //console.log("i am inside for loop");
                monday[index] = workout[index] + '<break time="1.3" />';
            }
            console.log(monday);
            
            var wednesday = [];
            for (let index = 11; index < 21; index++)
            {
                wednesday[index] = workout[index] + '<break time="1.3" />';
            }
            
            var friday = [];
            for (let index = 21; index < 31; index++)
            {
                friday[index] = workout[index] + '<break time="1.3" />';
            }
            
            conv.ask('<speak> On Monday. You want to do the following workout: <break time ="1.3" /> ' + monday + '. \n' +
                     'On Wednesday, do:  <break time ="1.3" /> ' + wednesday + '.\n' +
                     'On Friday, do:  <break time ="1.3" /> ' + friday + '. <break time="1.5" /> Make sure to do each workout for least 2 to 3 minutes.' +
                     'If you did not catch all that, let me know if you want me to send you the plan to your email. </speak>');
        }
        
    }
    else if(place === 'gym')
    {
        if(conv.data.planChoice === 'Lose Weight' || conv.data.planChoice === 'lose weight')
        {
            mon = ['bench press', 'triceps dips', 'incline dumbbell press', 'incline dumbble fly', 'triceps extension'] 
            wed = ['pull ups', 'bent over row', 'chin up', 'standing biceps curl', 'seated incline curl']
            fri = ['back squat', 'good morning', 'glute bridge', 'over head press', 'rack pull']
            
            conv.ask('<speak> On Monday. You want to do the following workout: <break time ="1.3" /> ' + mon + '. \n' +
                     'On Wednesday, do:  <break time ="1.3" /> ' + wed + '.\n' +
                     'On Friday, do:  <break time ="1.3" /> ' + fri + '. <break time="1.8" /> Make sure to do 2 to 3 sets for each workout, each set can be 6 to 8 reps.' +
                     'If you did not catch all that, let me know if you want me to send you the plan to your email. </speak>');
        }
    }
  }
  else
  {
    conv.close("Sorry. There seems to be an error on our end. We will resolve this as soon as possible. You can try me later after 24 hours period");
  }
});

app.intent(EMAIL_INTENT, (conv, params, emailOption)=> {
    conv.data.email = emailOption;
    
    if(conv.data.email === "email" || conv.data.email === "yes")
    {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: 'dharampreetgil10@gmail.com',
          //to: 'chan.kham005@gmail.com',
          from: 'test@example.com',
          subject: 'Workout plan from Coach Chan',
          text: 'Do the following workout at least 30 minutes: \n\n' + 
                'Monday: bench press , triceps dips, incline dumbbell press, incline dumbble fly, triceps extension \n\n' + 
                'Wednesday: pull ups, bent over row, chin up, standing biceps curl, seated incline curl \n\n' +
                'Friday:back squat, good morning, glute bridge, over head press, rack pull \n\n' + 
                'If you do not know how to do any of this workout, you can check the link below for step by step tutorial \n' +
                'https://www.coachmag.co.uk/full-body-workouts/6179/a-four-week-gym-routine-to-get-big-and-lean \n\n' +
                'Regards, \n\n Workout Planner Team',
        };
        sgMail.send(msg);
     
        
    }
    else
    {
        conv.close('<speak>At the moment, this feature is being implemented <break time="0.7" />. I apologize for the inconvenience. <break time="1" /> Now. I will self-destruct in 3, <break time="1" />' +
    '2,  <break time="1" /> 1 <break time="1" />. Just Kidding. I\'ll see you later. <break time="0.75" /> BYE! </speak>');
    }
    
    connection.close();
    conv.close('the email has been sent, enjoy!');
    
    
});



//calculate BMI value
function Cal_BMI(weight, height) {
    
    let BMI = (weight)/((height)^2);
    let ret = Math.round(BMI * 10) / 10;
    return ret;
}

//calculate fat percentage value 
//Adult Body Fat = (1.20 x BMI) + (0.23 x Age) - (10.8 x sex) - 5.4
//Note: in case of the BMI estimation formula, sex is 1 for males and 0 for females.
function Fat_percent(BMI_val, sexNum, age){
    
    var bodyFat = (1.20 * BMI_val) + (0.23 * age) - (10.8 * sexNum) - 5.4;
    let ret = Math.round(bodyFat * 10) / 10;
    return ret;
}

exports.addNumbers = functionss.https.onCall((data) => {
  firstNumber = data.firstNumber;  
});

//new version of welcome intent. This one asks the  user for permission to get the name from google account
//and this name will persist across multiple sessions. 
app.intent(WELCOME_INTENT, (conv) => {
  const name = conv.user.storage.userName;
  if (!name) {
    // Asks the user's permission to know their name, for personalization.
    conv.ask(new Permission({
      context: 'Hi there, Welcome to Workout Planner. I am a smart assistant that ' +
        'can provide you with tips on how to get started with your workout routine. Before we get started',
      permissions: 'NAME',
    }));
  } else {
    conv.ask(`Hello again, ${name}. It\'s been a while since we last spoke. How may I assist you today? 
              You can say, I want to Lose Weight or Gain Muscle, or Improve Stability.`);
  }
});


app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    // If the user denied our request, go ahead with the conversation.
    conv.ask(`Alright, no problem. How may I assist you today? 
              You can say, I want to Lose Weight or Gain Muscle, or Improve Stability.`);
  } else {
    // If the user accepted our request, store their name in
    // the 'conv.user.storage' object for future conversations.
    conv.user.storage.userName = conv.user.name.display;
    conv.ask(`Thanks, ${conv.user.storage.userName}. ` +
      `How may I assist you today? 
       You can say, I want to Lose Weight or Gain Muscle, or Improve Stability.`);
  }
});


app.intent(FALLBACK_INTENT, (conv) => {
    conv.ask("Sorry, I don't know what you mean by that. Could you repeat that again?");
});





exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
