const {
  ComponentDialog,
  WaterfallDialog,
  TextPrompt,
  NumberPrompt
} = require('botbuilder-dialogs');
const { WEATHER_FORCAST_DIALOG, WeatherForecastDialog } = require('./weatherForecastDialog');

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const EDUCATION_DIALOG = 'EDUCATION_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';

class EducationDialog extends ComponentDialog {
  constructor(dialog) {
    super(EDUCATION_DIALOG);

    this.dialog = dialog;

    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(new NumberPrompt(NUMBER_PROMPT));
    this.dialog.addDialog(new WeatherForecastDialog(this));

    this.addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.askMajor.bind(this),
        this.getMajor.bind(this),
        this.askGraduated.bind(this),
        this.getGraduated.bind(this),
        this.getInfor.bind(this),
        this.askChooseWeather.bind(this),
        this.chooseWeathere.bind(this)
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async askMajor(step) {
    return await step.prompt(TEXT_PROMPT, {
      prompt: 'Whats your major?'
    });
  }

  async getMajor(step) {
    step.values.major = step.result;
    const userProfile = await this.dialog.conversationDataAccessor.get(step.context);
    userProfile.major = step.result;

    await step.context.sendActivity(`I recieved your major is ${step.result}`);

    return await step.next();
  }

  async askGraduated(step) {
    return await step.prompt(TEXT_PROMPT, {
      prompt: 'have you graduated?'
    });
  }

  async getGraduated(step) {
    step.values.graduated = step.result;
    await step.context.sendActivity('I recieved all your information');

    return await step.next();
  }

  async getInfor(step) {
    const userProfile = await this.dialog.conversationDataAccessor.get(step.context);
    await step.context.sendActivity(`Your information is name: ${userProfile.name}, age: ${userProfile.age}, address: ${userProfile.address}, major: ${userProfile.major}`);
    return await step.next();
  }

  async askChooseWeather(step) {
    return await step.prompt(TEXT_PROMPT, {
      prompt: 'Do you want to ask Weather?'
    });
  }

  async chooseWeathere(step) {
    step.values.isWeather = step.result.toLowerCase();
    if (step.values.isWeather === 'no') {
      await step.context.sendActivity('Thank you');
      return await step.endDialog();
    } else if (step.values.isWeather === 'yes') {
      return await step.replaceDialog(WEATHER_FORCAST_DIALOG);
    }
    return await step.endDialog();
  }
}
// Add prompts
module.exports = {
  EducationDialog,
  EDUCATION_DIALOG
};
