const { BotFrameworkAdapter, TokenResolver } = require('botbuilder');
const {
  INVOKE_RESPONSE_KEY,
  Channels,
  ActivityTypes
} = require('botbuilder-core');
const { delay } = require('botbuilder-stdlib');

class CustomCloudAdapter extends BotFrameworkAdapter {
  async sendActivities(context, activities) {
    const responses = [];
    for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        switch (activity.type) {
            case 'delay':
                await delay(typeof activity.value === 'number' ? activity.value : 1000);
                responses.push({});
                break;
            case ActivityTypes.InvokeResponse:
                // Cache response to context object. This will be retrieved when turn completes.
                context.turnState.set(INVOKE_RESPONSE_KEY, activity);
                responses.push({});
                break;
            default: {
                if (!activity.serviceUrl) {
                    throw new Error('BotFrameworkAdapter.sendActivity(): missing serviceUrl.');
                }
                if (!activity.conversation || !activity.conversation.id) {
                    throw new Error('BotFrameworkAdapter.sendActivity(): missing conversation id.');
                }
                if (activity && BotFrameworkAdapter.isStreamingServiceUrl(activity.serviceUrl)) {
                    if (!this.isStreamingConnectionOpen) {
                        throw new Error(
                            'BotFrameworkAdapter.sendActivities(): Unable to send activity as Streaming connection is closed.'
                        );
                    }
                    TokenResolver.checkForOAuthCards(this, context, activity);
                }
                const client = this.getOrCreateConnectorClient(context, activity.serviceUrl, this.credentials);

                const options = { customHeaders: { 'authorization-token': `${ process.env.AUTHORIZATION_TOKEN_FB }` } };
                // const options = { customHeaders: { 'authorization-token': 'auth-token' } };

                if (activity.type === ActivityTypes.Trace && activity.channelId !== Channels.Emulator) {
                    // Just eat activity
                    responses.push({});
                } else if (activity.replyToId) {
                    responses.push(
                        await client.conversations.replyToActivity(
                            activity.conversation.id,
                            activity.replyToId,
                            activity,
                            options
                        )
                    );
                } else {
                    responses.push(
                        await client.conversations.sendToConversation(activity.conversation.id, activity)
                    );
                }
                break;
            }
        }
    }
    return responses;
}
}
module.exports = {
  CustomCloudAdapter
};
