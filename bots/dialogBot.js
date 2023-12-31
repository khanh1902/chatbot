// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');

// const USER_PROFILE_PROPERTY = 'userProfile';

class DialogBot extends ActivityHandler {
  /**
   *
   * @param {ConversationState} conversationState
   * @param {UserState} userState
   * @param {Dialog} dialog
   */
  constructor(conversationState, userState, dialog) {
    super();
    if (!conversationState) {
      throw new Error(
        '[DialogBot]: Missing parameter. conversationState is required'
      );
    }
    if (!userState) {
      throw new Error('[DialogBot]: Missing parameter. userState is required');
    }
    if (!dialog) {
      throw new Error('[DialogBot]: Missing parameter. dialog is required');
    }

    this.conversationState = conversationState;
    this.userState = userState;
    this.dialog = dialog;
    this.dialogState = this.conversationState.createProperty('DialogState');
    // this.convers

    this.onMessage(async (context, next) => {
      console.log('Running dialog with Message Activity.');
      await this.dialog.run(context, this.dialogState);
      await next();
    });

    this.onMembersAdded(async (context, next) => {
        const membersAdded = context.activity.membersAdded;
        if (membersAdded) {
            await context.sendActivity('Wellcome to information chat bot');
        }
        await next();
    });
  }

  /**
   * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
   */
  async run(context) {
    await super.run(context);

    // Save any state changes. The load happened during the execution of the Dialog.
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }
}

module.exports.DialogBot = DialogBot;
