// for using sentry
require('../lib/monitoring/instrument');
const { ChannelType, MessageFlags } = require('discord.js');
const ErrorHandler = require('../lib/monitoring/errorHandler');
require('dotenv').config({ quiet: true });

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

		await message.edit({
			content: `このメッセージは、スレッド管理のために送信されました。このメッセージは数秒後に削除されます。\n<@&${process.env.memberRoleID}>を招待しました。`,
		});

		return message.delete({ timeout: 5000 });
	} catch (err) {
		ErrorHandler.logError(err, 'threadCreate');
	}
};
