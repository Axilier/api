/** @format */

// export function getLocalAccount(req, res) {
//     try {
//         if (!req.user) return res.sendStatus(401);
//         if (!req.user.local_acc_id) return res.send('No associated local account');
//         const response = await mysqlController.getLocalUser(req.user.user_id);
//         if (response.length !== 1) throw new Error('more than or less than 1 result returned');
//         return res.send({
//             email: response[0].email,
//             accountId: response[0].user_id,
//         });
//     } catch (err) {
//         const logInfo = `${
//             req.user?.user_id || 'user_id'
//         }:get_local_account:${getNeatDate()} \n Error: ${err}`;
//         logger.error(logInfo);
//         return res.send({ message: 'Something went wrong', error: true });
//     }
// }
