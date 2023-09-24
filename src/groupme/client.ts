export type BotId = string;

export type BotMessage = {
  bot_id: BotId;
  text: string;
  picture_url?: string;
}

export type Succeeded = true;
export type Failed = false;
export type PostMsgStatus = Succeeded | Failed;

const BOT_MSG_URL = "https://api.groupme.com/v3/bots/post";

export default class GroupmeClient {
  private botId: BotId;

  public constructor(botId: BotId) {
    this.botId = botId;
  }

  public async postBotMessage(content: string): Promise<boolean> {
    const body = {
      bot_id: this.botId,
      text: content,
    };

    const response = await fetch(new Request({
      url: BOT_MSG_URL,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }));

    // Return true for success and false if the server rejected
    return response.status == 202;
  }
}
