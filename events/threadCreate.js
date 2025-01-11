// for using sentry
require("../instrument");
const Sentry = require("@sentry/node");
const { ChannelType, MessageFlags } = require("discord.js");
require("dotenv").config();

module.exports = async (client, thread) => {
  try {
    // まずは自分がスレッドに参加する
    if (thread.joinable) await thread.join();

    // スレッドがプライベートスレッドだった場合は無視する。
    if (thread.type === ChannelType.PrivateThread) return;

    // 特定のロールを持ったユーザーをスレッドに招待する
    let message = await thread.send({
      content: `このメッセージは、スレッド管理のために送信されました。このメッセージは数秒後に削除されます。`,
      flags: MessageFlags.SuppressNotifications,
    });

    message.edit({
      content: `このメッセージは、スレッド管理のために送信されました。このメッセージは数秒後に削除されます。\n<@&${process.env.memberRoleID}>を招待しました。`,
    });

    message.delete({ timeout: 5000 });
  } catch (err) {
    Sentry.captureException(err);
  }
};
