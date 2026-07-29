const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotificationOnMessage = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    const msg = snap.data();
    const senderEmail = msg.senderEmail;
    
    const allowed = ["mgbhaukali@gmail.com", "manshi@gmail.com"];
    const receiverEmail = allowed.find(e => e !== senderEmail);
    if (!receiverEmail) return null;
    
    const tokenDoc = await admin.firestore().collection('tokens').doc(receiverEmail).get();
    if (!tokenDoc.exists) return null;
    
    let body = 'New message';
    if (msg.type === 'image') body = '📷 New image received';
    else if (msg.type === 'voice') body = '🎤 New voice note received';
    else body = (msg.text || '').substring(0, 150);
    
    try {
      await admin.messaging().send({
        token: tokenDoc.data().token,
        notification: { title: '📩 NTA Research Portal', body },
        webpush: {
          notification: {
            icon: 'https://csirhrdg.res.in/SiteContent/ManagedContent/ContentImage/20190311110031159csir.png',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            tag: 'msg-' + context.params.messageId
          }
        }
      });
      console.log('✅ Notification sent to', receiverEmail);
    } catch (e) {
      console.error('❌ FCM Error:', e.message);
    }
  });