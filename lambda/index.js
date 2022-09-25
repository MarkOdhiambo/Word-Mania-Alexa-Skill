/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const riddlefunctions=require('./riddleFunctions.js');
const triviaFunctions=require('./triviaFunctions.js');
const persistenceAdapter=require('ask-sdk-s3-persistence-adapter');

function variationFunction(varList){
    var selected=varList[Math.floor(Math.random() * varList.length)];
    return selected
}

function displayAPL(title,subtitle,handlerInput){
            //====================================================================
        // Add a visual with Alexa Layouts
        //====================================================================
        
        // Import an Alexa Presentation Language (APL) template
        var APL_simple = require('./documents/APL_simple.json');
        
        // Check to make sure the device supports APL
        if (
          Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
            'Alexa.Presentation.APL'
          ]
        ) {
      // add a directive to render our simple template
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        document: APL_simple,
        datasources: {
          myData: {
            //====================================================================
            // Set a headline and subhead to display on the screen if there is one
            //====================================================================
            Title: title,
            Subtitle: subtitle,
          },
        },
      });
    }
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        
        //Get SESSION attributes for gameScore and newUser
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};
        
        const gameScore = sessionAttributes.hasOwnProperty('gameScore') ? sessionAttributes.gameScore : 0;
        
        sessionAttributes.score=0
        sessionAttributes.attempt=0
        const newUser = sessionAttributes.hasOwnProperty('newUser') ? sessionAttributes.newUser : false;
        sessionAttributes.current_riddle=null
        sessionAttributes.current_trivia=null
        let speakOutput
         //Set speakOutput depending on whether this is a new or returning user
        var welcomeList=['<amazon:emotion name="excited" intensity="medium">Welcome back,</amazon:emotion> what are you up for today. Playing trivia or riddles?'
        ,'<amazon:emotion name="excited" intensity="medium">Welcome back to word mania.</amazon:emotion>Your current game score is '+gameScore+'. What are you up for today, Trivia questions or Riddles?',
        '<amazon:emotion name="excited" intensity="low">Your back.<break time=".2s"/> Thats great!</amazon:emotion> Your total game score is '+gameScore+'.What are you up for today, trivia or riddles?',
        '<amazon:emotion name="excited" intensity="medium">Welcome back to word mania.</amazon:emotion> Are you playing trivia or riddles today?']
        if(newUser)
        {
            speakOutput = '<amazon:emotion name="excited" intensity="medium">Hey there, welcome to world mania.</amazon:emotion> I can ask you a riddle or trivia questions. Which would you like to play?'
            sessionAttributes.newUser = false;
        }
        else
        {
            speakOutput = variationFunction(welcomeList)
        }
        //====================================================================
        // Add a visual with Alexa Layouts
        //====================================================================
        
        // Import an Alexa Presentation Language (APL) template
        var APL_simple = require('./documents/APL_simple.json');
        
        // Check to make sure the device supports APL
        if (
          Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
            'Alexa.Presentation.APL'
          ]
        ) {
      // add a directive to render our simple template
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        document: APL_simple,
        datasources: {
          myData: {
            //====================================================================
            // Set a headline and subhead to display on the screen if there is one
            //====================================================================
            Title: 'Word Mania',
            Subtitle: 'Riddles and Trivia Questions.',
          },
        },
      });
    }
    
    return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
    }
};

function playRiddle(handlerInput){
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        //Import the riddle functions and get a random riddle
        
        sessionAttributes.currentGame="riddles"
        // get the current session attributes, creating an object you can read/update
        var speakOutput = '';
        var title='';
        var subtitle='';
        //check if there's a current riddle. If so, repeat the question and exit.
        if (
            sessionAttributes.hasOwnProperty('current_riddle') &&
            sessionAttributes.current_riddle !== null
        ) {
            speakOutput = `${sessionAttributes.current_riddle.riddle} `;
            title=speakOutput
            subtitle='Game on!'
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
        
        //check for past riddles array and create it if not available
        if (!sessionAttributes.hasOwnProperty('past_riddles'))
            sessionAttributes.past_riddles = [];
            
        const riddle=riddlefunctions.getRandomRiddle(sessionAttributes.past_riddles);
        var riddlequestion = riddle.riddle
        
        // Check to see if there are any riddles left.
        if (sessionAttributes.past_riddles.length === 100) {
            speakOutput = `You have run out of riddles. Try playing another game?`;
            title='Congrats Champ'
            subtitle='Try Playing Trivia'
        } else {
            //set the "current_celeb" attribute
            sessionAttributes.current_riddle = riddle;
            sessionAttributes.currentGame="riddles"
        
            //Ask the question
            speakOutput = `${riddlequestion}`;
            title=speakOutput
            subtitle='Game on!'
        }
        //save the session attributes
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        //====================================================================
        // Add a visual with Alexa Layouts
        //====================================================================
        
        // Import an Alexa Presentation Language (APL) template
        var APL_simple = require('./documents/APL_simple.json');
        
        // Check to make sure the device supports APL
        if (
          Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
            'Alexa.Presentation.APL'
          ]
        ) {
          // add a directive to render our simple template
          handlerInput.responseBuilder.addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: APL_simple,
            datasources: {
              myData: {
                //====================================================================
                // Set a headline and subhead to display on the screen if there is one
                //====================================================================
                Title: riddlequestion,
                Subtitle: 'Game on!',
              },
            },
          });
        }
        return speakOutput
}

const PlayRiddleIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayRiddleIntent';
    },
    handle(handlerInput) {
        var speakOutput=playRiddle(handlerInput)
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

function playTrivia(handlerInput){
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.currentGame="trivia"
        
        // get the current session attributes, creating an object you can read/update
        var speakOutput = '';
        var title='';
        var subtitle='';
        //check if there's a current trivia. If so, repeat the question and exit.
        if (
            sessionAttributes.hasOwnProperty('current_trivia') &&
            sessionAttributes.current_trivia !== null
        ) {
            speakOutput = `${sessionAttributes.current_trivia.question} `;
            title=speakOutput
            subtitle='Game on!'
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
        //check for past riddles array and create it if not available
        if (!sessionAttributes.hasOwnProperty('past_trivia'))
            sessionAttributes.past_trivia = [];
            
        const trivia=triviaFunctions.getRandomTrivia(sessionAttributes.past_trivia);
        var triviaquestion = trivia.question
        // Check to see if there are any riddles left.
        if (sessionAttributes.past_riddles.length === 100) {
            speakOutput = `You have run out of trivia questions. Try playing the riddle game?`;
            title='Congrats Champ'
            subtitle='Try Playing riddles'
        } else {
            //set the "current_celeb" attribute
            sessionAttributes.current_trivia = trivia;
            sessionAttributes.currentGame="trivia"
        
            //Ask the question
            speakOutput = `${triviaquestion}`;
            title=speakOutput
            subtitle='Game on!'
        }
        //save the session attributes
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        //====================================================================
        // Add a visual with Alexa Layouts
        //====================================================================
        
        // Import an Alexa Presentation Language (APL) template
        var APL_simple = require('./documents/APL_simple.json');
        
        // Check to make sure the device supports APL
        if (
          Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
            'Alexa.Presentation.APL'
          ]
        ) {
          // add a directive to render our simple template
          handlerInput.responseBuilder.addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: APL_simple,
            datasources: {
              myData: {
                //====================================================================
                // Set a headline and subhead to display on the screen if there is one
                //====================================================================
                Title: triviaquestion,
                Subtitle: 'Game on!',
              },
            },
          });
        }
        return speakOutput
}
    
const PlayTriviaIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayTriviaIntent';
    },
    handle(handlerInput) {
        var speakOutput=playTrivia(handlerInput)
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const GetAnswerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetAnswerIntent';
    },
    handle(handlerInput) {
        // get the current session attributes, creating an object you can read/update
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var speakOutput = ``;
        var title ='';
        var subtitle='';
        console.log(sessionAttributes.currentGame)
        
        //get answer value
        var answer = handlerInput.requestEnvelope.request.intent.slots.answer.value;
        
        //Get the game being played 
        if(sessionAttributes.currentGame==="riddles"){
            // if there's a current_riddle attribute but it's null, or there isn't one
            // error, cue them to say "yes" and end
            if ((
                sessionAttributes.hasOwnProperty('current_riddle') &&
                sessionAttributes.current_riddle === null) ||
              !sessionAttributes.hasOwnProperty('current_riddle')
            ) {
                speakOutput =
                    "I'm sorry, there's no riddle right now. Would you like me to tell you one?";
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
            //Share the answer
            const winner=riddlefunctions.checkRiddleAnswer(answer,sessionAttributes.current_riddle.answer.toLowerCase());

            sessionAttributes.past_riddles.push(sessionAttributes.current_riddle);
            const riddleAnswer = sessionAttributes.current_riddle.answer;
            
            //Let's now check if there's a current score. If not, initialize it.
            if (!sessionAttributes.hasOwnProperty('score'))
              sessionAttributes.score = 0;
            if (!sessionAttributes.hasOwnProperty('attempt'))
              sessionAttributes.attempt = 0;
            
            //Did they get it?
            if (winner) {
                sessionAttributes.score += 1;
                var titleList=['Congratulations!','You did it','Champ','Up for another one?','Good'];
                title = variationFunction(titleList);
                subtitle = `Today Score:${sessionAttributes.score} Total Score:${sessionAttributes.gameScore}`;
                var corrListRiddles=[`${riddleAnswer}.that's correct! Your score for today is now ${sessionAttributes.score}. Want to try another?`,`<amazon:emotion name="excited" intensity="low">Thats right.</amazon:emotion> You think you can get the next one too? `,`<amazon:emotion name="excited" intensity="low">Thats correct.</amazon:emotion> Your score is now ${sessionAttributes.score}. Up for another round?`,`<amazon:emotion name="excited" intensity="medium">Correct.</amazon:emotion> Want to go again?`]
                speakOutput = variationFunction(corrListRiddles);
                sessionAttributes.current_riddle = null;
                sessionAttributes.attempt = 0;
                sessionAttributes.yes=true
                sessionAttributes.no=true
            } else {
                if(sessionAttributes.attempt===2){
                    var letter=riddleAnswer[0];
                    var wrongList2=[`${answer}. Wasn't it. Let me give you a hint. It begins with the letter ${letter}?`,`Wrong. Let me give you a hint. It starts with the letter ${letter}`,`${answer} is wrong. Let me help you out. It begins with the letter ${letter}`]
                    speakOutput=variationFunction(wrongList2)
                    title=letter
                    subtitle='You can do it!'
                    sessionAttributes.attempt+=1
                }else if(sessionAttributes.attempt===3){
                    letter=riddleAnswer[1];
                    var wrongList3=[`Let me give you another hint, it is followed by the letter ${letter}`,`Another hint. It is followed by the letter ${letter}`,`Wrong. It is followed by the letter ${letter}`]
                    speakOutput=variationFunction(wrongList3);
                    title=riddleAnswer[0]+letter
                    sessionAttributes.attempt+=1;
                }else if(sessionAttributes.attempt===4){
                    var wrongList4=[`Nope. The right answer is ${riddleAnswer}. Up for another round?`,`Wrong. The right answer is ${riddleAnswer}. Wanna go again?`,`${riddleAnswer} is the right answer. Nice try though, up for another round?`];
                    speakOutput=variationFunction(wrongList4)
                    title=riddleAnswer
                    sessionAttributes.current_riddle = null;
                    sessionAttributes.attempt = 0;
                    subtitle='Another round'
                    sessionAttributes.yes=true
                    sessionAttributes.no=true
                }
                else{
                    var wrongList1=[`${answer} is wrong`,`Nope ${answer} isn't it. Try something else?`,`Wrong. Try again? `,`That ain't it. Try something else?`];
                    title = `${answer} is wrong`;
                    subtitle = 'Keep Trying.';
                    speakOutput = variationFunction(wrongList1);
                    sessionAttributes.attempt+=1; 
                }
            }
            //store all the updated session data
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        }else if(sessionAttributes.currentGame==="trivia"){
            // if there's a current_trivia attribute but it's null, or there isn't one
            // error, cue them to say "yes" and end
            if ((
                sessionAttributes.hasOwnProperty('current_trivia') &&
                sessionAttributes.current_trivia === null) ||
              !sessionAttributes.hasOwnProperty('current_trivia')
            ) {
                speakOutput =
                    "I'm sorry, there's no trivia right now. Would you like to tell you one?";
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
            //Share the answer
            const triviaWinner=triviaFunctions.checkTriviaAnswer(answer,sessionAttributes.current_trivia.answer);


            sessionAttributes.past_trivia.push(sessionAttributes.current_trivia);
            const triviaAnswer = sessionAttributes.current_trivia.answer;
            
            //Let's now check if there's a current score. If not, initialize it.
            if (!sessionAttributes.hasOwnProperty('score'))
              sessionAttributes.score = 0;
            if (!sessionAttributes.hasOwnProperty('attempt'))
              sessionAttributes.attempt = 0;
            
            //Did they get it?
            if (triviaWinner) {
                sessionAttributes.score += 1;
                var titleListTrivia=['Congratulations!','You did it','Champ','Up for another one?','Good'];
                title = variationFunction(titleListTrivia);
                title = 'Congratulations!';
                subtitle = `Today Score:${sessionAttributes.score} Total Score:${sessionAttributes.gameScore}`;
                var corrListTrivia=[`${triviaAnswer}.that's correct! Your score for today is now ${sessionAttributes.score}. Want to try another?`,`<amazon:emotion name="excited" intensity="low">Thats right.</amazon:emotion> You think you can get the next one too? `,`<amazon:emotion name="excited" intensity="low">Thats correct.</amazon:emotion> Your score is now ${sessionAttributes.score}. Up for another round?`,`<amazon:emotion name="excited" intensity="medium">Correct.</amazon:emotion> Want to go again?`]
                speakOutput = variationFunction(corrListTrivia);
                sessionAttributes.current_trivia = null;
                sessionAttributes.attempt = 0;
                sessionAttributes.yes=true
                sessionAttributes.no=true
            } else {
                if(sessionAttributes.attempt===2){
                    letter=triviaAnswer[0];
                    var wrongList2Trivia=[`${answer} wasn't it. Let me give you a hint. It begins with the letter ${letter}?`,`Wrong. Let me give you a hint. It starts with the letter ${letter}`,`${answer} is wrong. Let me help you out. It begins with the letter ${letter}`]
                    speakOutput=variationFunction(wrongList2Trivia);
                    title=letter
                    subtitle='You can do it!'
                    sessionAttributes.attempt+=1
                }else if(sessionAttributes.attempt===3){
                    letter=triviaAnswer[1];
                    var wrongList3Trivia=[`Let me give you another hint, it is followed by the letter ${letter}`,`Another hint. It is followed by the letter ${letter}`,`Wrong. It is followed by the letter ${letter}`]
                    speakOutput= variationFunction(wrongList3Trivia);
                    title=triviaAnswer[0]+letter
                    sessionAttributes.attempt+=1;
                }else if(sessionAttributes.attempt===4){
                    var wrongList4Trivia=[`Nope, the right answer is ${triviaAnswer}. Up for another round?`,`Wrong, the right answer is ${triviaAnswer}, wanna go again?`,`${triviaAnswer} is the right answer. Nice try though, up for another round?`]
                    speakOutput=variationFunction(wrongList4Trivia)
                    title=triviaAnswer
                    sessionAttributes.current_riddle = null;
                    sessionAttributes.attempt = 0;
                    subtitle='Another round'
                }
                else{
                    var wrongListTrivia=[`${answer} is wrong`,`Nope ${answer} isn't it. Try something else?`,`Wrong. Try again? `,`That ain't it, try something else?`];
                    title = `${answer} is wrong`;
                    subtitle = 'Keep Trying.';
                    speakOutput = variationFunction(wrongListTrivia);
                    sessionAttributes.attempt+=1; 
                    sessionAttributes.yes=true
                    sessionAttributes.no=true
                }
            }
            
            //store all the updated session data
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        }else{
            speakOutput="Did you select a game first before giving an answer?"
            title='pick a game'
            subtitle='Trivia or riddles'
        }

        //====================================================================
        // Add a visual with Alexa Layouts
        //====================================================================
        
        // Import an Alexa Presentation Language (APL) template
        var APL_simple = require('./documents/APL_simple.json');
        
        // Check to make sure the device supports APL
        if (
          Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
            'Alexa.Presentation.APL'
          ]
        ) {
          // add a directive to render our simple template
          handlerInput.responseBuilder.addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: APL_simple,
            datasources: {
              myData: {
                //====================================================================
                // Set a headline and subhead to display on the screen if there is one
                //====================================================================
                Title: title,
                Subtitle: subtitle,
              },
            },
          });
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const GiveUpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GiveUpIntent';
    },
    handle(handlerInput) {
        var speakOutput = '';
        var title='';
        var subtitle='';
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        if(sessionAttributes.currentGame==="riddles"){
            var giveUpList=[`It's okay. The correct answer is ${sessionAttributes.current_riddle.answer}. Would you like to keep playing?`,`${sessionAttributes.current_riddle.answer} is the correct answer, would you like to keep playing?`,`${sessionAttributes.current_riddle.answer} is the answer, want to try another one?`]
            speakOutput=variationFunction(giveUpList);
            title=sessionAttributes.current_riddle.answer
            sessionAttributes.attempt=0;
            subtitle='Keep playing?'
            sessionAttributes.yes=true
            sessionAttributes.no=true
            sessionAttributes.current_riddle=null
        }else if(sessionAttributes.currentGame==="trivia" ){
            var giveUpTriviaList=[`It's okay. The correct answer is ${sessionAttributes.current_trivia.answer}. Would you like to keep playing?`,`${sessionAttributes.current_trivia.answer} is the correct answer, would you like to keep playing?`,`${sessionAttributes.current_trivia.answer} is the answer, want to try another one?`]
            speakOutput=variationFunction(giveUpTriviaList);
            title=sessionAttributes.current_trivia.answer
            sessionAttributes.attempt=0;
            subtitle='Keep playing?'
            sessionAttributes.yes=true
            sessionAttributes.no=true
            sessionAttributes.current_trivia=null
        }else{
            speakOutput='Is there a game you would like to play between trivia and riddles?'
        }
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        displayAPL(title,subtitle,handlerInput)
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RepeatIntent';
    },
    handle(handlerInput) {
        var speakOutput = '';
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        if(sessionAttributes.currentGame==="riddles"){
            speakOutput=sessionAttributes.current_riddle.riddle;
        }else if(sessionAttributes.currentGame==="trivia" ){
            speakOutput=sessionAttributes.current_trivia.question;
        }else{
            speakOutput='I can only repeat the riddles and trivia. Which would you like to play'
        }
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        var speakOutput = '';
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        if(sessionAttributes.currentGame==="riddles" && sessionAttributes.yes===true){
            speakOutput=playRiddle(handlerInput)
            sessionAttributes.yes=false
        }else if(sessionAttributes.currentGame==="trivia" && sessionAttributes.yes===true){
            speakOutput=playTrivia(handlerInput)
            sessionAttributes.yes=false
        }else{
            speakOutput='Is there a game you would like to play between trivia and riddles?'
        }
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const NoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        var speakOutput = '';
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        if(sessionAttributes.currentGame==="riddles" && sessionAttributes.no===true){
            speakOutput="Do you want ot play trivia or quit?"
            sessionAttributes.no=false
            sessionAttributes.currentGame=null
        }else if(sessionAttributes.currentGame==="trivia" && sessionAttributes.no===true){
            speakOutput='Do you want to go play riddles or choose to exit?'
            sessionAttributes.no=false
            sessionAttributes.currentGame=null
        }else{
            speakOutput='Is there a game you would like to play between trivia and riddles?'
        }
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Word mania is a word game compilation for riddles and trivia questions, which one would you like to play?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Hey there, In word mania you can pick the game you want to play riddles or trivia, which is it going to be?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.gameScore+=sessionAttributes.score;
        
        const speakOutput = 'Goodbye,Thank You for playing Word Mania!'
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
// This is the handling of the persistent session
const LoadGameInterceptor = {
    async process(handlerInput) {

        const attributesManager = handlerInput.attributesManager;

        //Retrieve PERSISTENT attributes object
        //If not defined, then set to empty object
        const sessionAttributes = await attributesManager.getPersistentAttributes() || {};
    
        //If gameScore is true, return the gameScore; otherwise, set to -1
        const gameScore = sessionAttributes.hasOwnProperty('gameScore') ? sessionAttributes.gameScore : -1;
        
        //If score is -1, this is the first time the user is using the hack score
        if(gameScore === -1)
        {
            //setSet sessionAttributes
            sessionAttributes.newUser = true;
            sessionAttributes.gameScore = 0;
            
            attributesManager.setSessionAttributes(sessionAttributes);
        }
        else //this is a returning user; set the hackScore to value retrieved from S3
        {
            //Set sessionAttributes
            attributesManager.setSessionAttributes(sessionAttributes);
        }
    }
};
const SaveGameInterceptor = {
    async process(handlerInput) {

        const attributesManager = handlerInput.attributesManager;
        
        //Retrieve SESSION attributes object
        const sessionAttributes = attributesManager.getSessionAttributes() || {};
        //Set and save current SESSION attributes to PERSISTENT attributes
        attributesManager.setPersistentAttributes(sessionAttributes);
        await attributesManager.savePersistentAttributes(sessionAttributes);
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
    )
    .addRequestHandlers(
        LaunchRequestHandler,
        PlayRiddleIntentHandler,
        PlayTriviaIntentHandler,
        GetAnswerIntentHandler,
        GiveUpIntentHandler,
        RepeatIntentHandler,
        YesIntentHandler,
        NoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addRequestInterceptors(
	    LoadGameInterceptor)
    .addResponseInterceptors(
	    SaveGameInterceptor)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();