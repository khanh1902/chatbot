const {
  ComponentDialog,
  WaterfallDialog,
  TextPrompt,
  NumberPrompt
} = require('botbuilder-dialogs');

const weatherService = require('../service/weather.service');

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const WEATHER_FORCAST_DIALOG = 'WEATHER_FORCAST_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';

class WeatherForecastDialog extends ComponentDialog {
  constructor(dialog) {
    super(WEATHER_FORCAST_DIALOG);

    this.dialog = dialog;

    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(new NumberPrompt(NUMBER_PROMPT));

    this.addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.ask.bind(this),
        this.get.bind(this)
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async ask(step) {
    // eslint-disable-next-line no-unused-vars
    const test = await this.dialog.conversationDataAccessor.get(step.context);

    return await step.prompt(TEXT_PROMPT, {
      prompt: 'Where do you want to forecast?'
    });
  }

  async get(step) {
    const weather = await weatherService.askWearther(step.result);
    await step.context.sendActivity(`The weather at ${step._info.result}: ` + weather);
    await step.context.sendActivity('Thank you');

    return await step.endDialog();
  }
}
// Add prompts
module.exports = {
  WeatherForecastDialog,
  WEATHER_FORCAST_DIALOG
};
