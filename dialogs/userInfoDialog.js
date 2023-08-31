const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { WEATHER_FORCAST_DIALOG, WeatherForecastDialog } = require('./weatherForecastDialog');
const { EDUCATION_DIALOG, EducationDialog } = require('./educationDialog');

const { ActivityHandler, ActionTypes, ActivityTypes, CardFactory } = require('botbuilder');
const ASK_USER_INFORMATION_DIALOG = 'ASK_USER_INFORMATION_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';

class AskUserInformationDialog extends ComponentDialog {
  constructor(conversationState, adapter, userState) {
    super('CHAT');

    this.adapter = adapter;
    this.conversationState = conversationState;
    this.userState = userState;
    this.conversationDataAccessor = conversationState.createProperty('conversationData');
    this.dialogState = conversationState.createProperty('DialogState');
    this.dialogSet = new DialogSet(this.dialogState);

    this.dialogSet.add(this);
    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(new NumberPrompt(NUMBER_PROMPT));
    this.addDialog(new WeatherForecastDialog(this));
    this.addDialog(new EducationDialog(this));
    this.addDialog(
      new WaterfallDialog(ASK_USER_INFORMATION_DIALOG, [
        this.sentTemplate.bind(this),
        this.askName.bind(this),

        this.getName.bind(this),

        this.askAge.bind(this),
        this.getAge.bind(this),
        this.askAddress.bind(this),
        this.getAddress.bind(this),
        this.confirm.bind(this),
        this.askService.bind(this),
        this.chooseService.bind(this)
      ])
    );

    this.initialDialogId = ASK_USER_INFORMATION_DIALOG;
  }

  async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);
    const dialogContext = await this.dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }
  async sentTemplate(step) {
    const reply = { type: ActivityTypes.Message };
    
    const buttons = [
        { type: ActionTypes.OpenUrl, title: 'Link FB', value: 'https://www.messenger.com' },
        { type: ActionTypes.PostBack, title: 'Starting Chat', value: 'DEVELOPER_DEFINED_PAYLOAD' },

    ];

    const card = CardFactory.heroCard('', undefined,
        buttons, { text: 'You can upload an image or select one of the following choices.' });

    reply.attachments = [card];

    return await step.context.sendActivity(reply);
  }

  async askName(step) {
    const userProfile = await this.conversationDataAccessor.get(step.context, {});
    userProfile.name = step.context._activity?.from?.name;
    userProfile.age = step.context._activity?.attributes?.age;
    if (userProfile.name && userProfile.age) {
      return await step.prompt(TEXT_PROMPT, {
        prompt: 'Hello ' + userProfile.name
      });
    } else {
      return await step.prompt(TEXT_PROMPT, {
        prompt: 'Whats your name?'
      });
    }
  }

  async getName(step) {
    const userProfile = await this.conversationDataAccessor.get(step.context, {});
    if (userProfile.name) {
      return await step.next();
    } else {
      userProfile.name = step.result;
      await step.context.sendActivity(`I recieved your name is ${step.result}`);
      return await step.next();
    }
  }

  async askAge(step) {
    const userProfile = await this.conversationDataAccessor.get(step.context, {});
    if (userProfile.age) {
      return await step.next();
    }
    return await step.prompt(NUMBER_PROMPT, {
      prompt: 'Whats your age?'
    });
  }

  async getAge(step) {
    const userProfile = await this.conversationDataAccessor.get(step.context, {});
    if (userProfile.age) {
      return await step.next();
    } else {
      step.values.age = step.result;
      userProfile.age = step.result;
      await step.context.sendActivity(`I recieved your age is ${step.result}`);
      return await step.next();
    }
  }

  async askAddress(step) {
    return await step.prompt(TEXT_PROMPT, {
      prompt: 'Whats your address?'
    });
  }

  async getAddress(step) {
    step.values.address = step.result;

    await step.context.sendActivity(`I recieved your address is ${step.result}`);

    return await step.next();
  }

  async confirm(step) {
    const userProfile = await this.conversationDataAccessor.get(step.context, {});
    await step.context.sendActivity(`Your information is name: ${userProfile.name}, age: ${userProfile.age}, address: ${step.values.address}`);

    return await step.next();
  }

  async askService(step) {
    return await step.prompt(TEXT_PROMPT, {
      prompt: 'Do you want to ask Weather or Education?'
    });
  }

  async chooseService(step) {
    step.values.userResponse = step.result.toLowerCase();
    // const userProfile = await this.conversationDataAccessor.get(step.context);

    if (step.values.userResponse === 'weather') {
      return await step.replaceDialog(WEATHER_FORCAST_DIALOG);
    } else if (step.values.userResponse === 'education') {
      return await step.replaceDialog(EDUCATION_DIALOG);
    }
    return await step.endDialog();
  }

  async sendTypingIndicator(turnContext, isTyping) {
    const { context } = turnContext;
    const eventActivity = {
      type: isTyping ? CustomActivityTypes.Typing : CustomActivityTypes.StopTyping
    };
    if (context) return context.sendActivity(eventActivity);
    return await turnContext.sendActivity(eventActivity);
  }
}
// Add prompts
module.exports.AskUserInformationDialog = AskUserInformationDialog;
