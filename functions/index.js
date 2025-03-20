const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

const Stripe = require("stripe");
const stripe = new Stripe(functions.config().stripe.test_secret_key);


// Funcție care rulează la fiecare 5 minute

// Inițializează Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465, // sau 587  TLS
  secure: true, // true portul 465, false 587
  auth: {
    user: "contact@ydestiny.com",
    pass: "Timewatch132021!",
  },
});

// Funcția periodică pentru actualizarea abonamentelor utilizatorilor
exports.updateUserSubscriptions = functions.pubsub
    .schedule("*/5 * * * *")
    .onRun(async (context) => {
      try {
        const usersSnapshot = await db.collection("Users").get();

        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          const subscriptionId = userData.subscriptionId;

          if (!subscriptionId) continue;

          // Preia datele abonamentului din Stripe
          const subscription = await stripe.subscriptions.retrieve(
              subscriptionId,
          );
          const endDateInMillis = subscription.current_period_end * 1000;
          const subscriptionEndDate = new Date(endDateInMillis);

          const cancelAtEnd = subscription.cancel_at_period_end;
          const subscriptionStatus =
          subscription.status === "active" && cancelAtEnd ?
            "canceledUntilEnd" :
            subscription.status === "active" ?
            "active" :
            subscription.status === "canceled" &&
              !subscription.current_period_end ?
            "expired" :
            subscription.status === "incomplete" ||
              subscription.status === "incomplete_expired" ?
            "paymentFailed" :
            "canceledImmediately";

          const updates = {
            subscriptionActive: subscriptionStatus === "active",
            subscriptionStatus: subscriptionStatus,
            subscriptionEndDate: subscriptionEndDate,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          };

          if (
            subscriptionStatus === "active" &&
          userData.subscriptionStatus !== "active"
          ) {
            updates.subscriptionStartDate = new Date();
          }

          // Actualizează documentul utilizatorului în Firestore
          await userDoc.ref.update(updates);
          console.log(`Updated subscription for user: ${userDoc.id}`);
        }

        console.log("Subscription updates completed successfully.");
      } catch (error) {
        console.error("Error updating subscriptions:", error);
      }
    });


// === SEND WELCOME EMAIL ===
exports.sendWelcomeEmail = functions.firestore
    .document("Users/{userId}")
    .onCreate((snap, context) => {
      const newUser = snap.data();
      const email = newUser.email;
      const username = newUser.username;
      const targetLanguage = newUser.targetLanguage || "ro";

      // Mesaj de bun venit pentru Destiny (combinat în română și engleză)
      const emailMessage =
        `[RO]\nBun venit ${username} pe Destiny!\n\n` +
        `Descoperă-ți destinul prin astrologie și numerologie. ` +
        `Suntem încântați să te avem alături ` +
        `și îți dorim o experiență plină de revelații.\n\n` +
        `--------------------------------------------------\n\n` +
        `[EN]\nHello ${username},\n\n` +
        `Welcome to Destiny – the platform where astrology ` +
        `and numerology guide your connections. ` +
        `We are thrilled to have you onboard` +
        ` wish you an inspiring journey.\n\n` +
        `Best regards,\nThe Destiny Team`;

      let emailSubject = "";
      if (targetLanguage === "nl") {
        emailSubject = "Welkom bij Destiny!";
      } else if (targetLanguage === "en") {
        emailSubject = "Welcome to Destiny!";
      } else {
        emailSubject = "Bun venit pe Destiny!";
      }

      const mailOptions = {
        from: "contact@ydestiny.com",
        to: email,
        subject: emailSubject,
        text: emailMessage,
      };

      console.log("Sending welcome email to:", email);
      return transporter
          .sendMail(mailOptions)
          .then(() => {
            console.log("Welcome email sent successfully to:", email);
          })
          .catch((error) => {
            console.error("Error sending welcome email:", error);
          });
    });


// === SEND ACTIVATION EMAIL ===
exports.sendActivationEmail = functions.firestore
    .document("Users/{userId}")
    .onUpdate((change, context) => {
      const newUser = change.after.data();
      const previousUser = change.before.data();

      // Trimitem emailul doar dacă isActivated devine true
      if (!previousUser.isActivated && newUser.isActivated) {
        const email = newUser.email;
        const username = newUser.username;
        const targetLanguage = newUser.targetLanguage || "ro";

        const emailMessage =
          `[RO]\nBună ${username},\n\n` +
          `Contul tău Destiny a fost activat cu succes! ` +
          `Acum ești pregătit(ă) să explorezi conexiunile ` +
          `compatibile bazate pe astrologie și numerologie.\n\n` +
          `--------------------------------------------------\n\n` +
          `[EN]\nHello ${username},\n\n` +
          `Congratulations! Your Destiny account ` +
          `has been successfully activated. ` +
          `Start exploring compatible connections powered by astrology ` +
          `and numerology today.\n\n` +
          `Sincerely,\nThe Destiny Team`;

        let emailSubject = "";
        if (targetLanguage === "nl") {
          emailSubject = "Uw Destiny-account is geactiveerd!";
        } else if (targetLanguage === "en") {
          emailSubject = "Your Destiny account is activated!";
        } else {
          emailSubject = "Contul tău Destiny este activat!";
        }

        const mailOptions = {
          from: "contact@ydestiny.com",
          to: email,
          subject: emailSubject,
          text: emailMessage,
        };

        console.log("Sending activation email to:", email);
        return transporter
            .sendMail(mailOptions)
            .then(() => {
              console.log("Activation email sent successfully to:", email);
            })
            .catch((error) => {
              console.error("Error sending activation email:", error);
            });
      } else {
        return null;
      }
    });


// === SEND SUBSCRIPTION EMAIL ===
exports.sendSubscriptionEmail = functions.firestore
    .document("Users/{userId}")
    .onUpdate((change, context) => {
      const newUser = change.after.data();
      const previousUser = change.before.data();

      // Trimitem emailul doar dacă abonamentul a fost activat acum
      if (!previousUser.subscriptionActive && newUser.subscriptionActive) {
        const email = newUser.email;
        const username = newUser.username;
        // const subName = newUser.subName;
        const targetLanguage = newUser.targetLanguage || "ro";

        const emailMessage =
          `[RO]\nBună ${username},\n\n` +
          `Îți mulțumim că te-ai abonat pe Destiny! ` +
          `Prin astrologie și numerologie, Destiny îți va oferi` +
          ` conexiuni compatibile. ` +
          `În curând vei primi profiluri ` +
          `care se potrivesc destinului tău.\n\n` +
          `--------------------------------------------------\n\n` +
          `[EN]\nHello ${username},\n\n` +
          `Thank you for subscribing on Destiny! ` +
          `Destiny leverages astrology and numerology to bring you ` +
          `compatible connections. ` +
          `Soon, you will receive profiles that match your destiny.\n\n` +
          `Best regards,\nThe Destiny Team`;

        let emailSubject = "";
        if (targetLanguage === "nl") {
          emailSubject = `Uw abonnement is geactiveerd!`;
        } else if (targetLanguage === "en") {
          emailSubject = `Your subscription is activated!`;
        } else {
          emailSubject = `Abonamentul tău este activat!`;
        }

        const mailOptions = {
          from: "contact@ydestiny.com",
          to: email,
          subject: emailSubject,
          text: emailMessage,
        };

        console.log("Sending subscription email to:", email);
        return transporter
            .sendMail(mailOptions)
            .then(() => {
              console.log("Subscription email sent successfully to:", email);
            })
            .catch((error) => {
              console.error("Error sending subscription email:", error);
            });
      } else {
        return null;
      }
    });


// === SEND MISSING RESPONSES REMINDER ===
exports.sendMissingResponsesReminder = functions.pubsub
    .schedule("0 9 */2 * *")// Se execută zilnic la ora 9:00 AM
    .onRun(async (context) => {
      try {
        const usersSnapshot = await db.collection("Users").get();

        // Parcurgem fiecare utilizator
        usersSnapshot.forEach(async (userDoc) => {
          const userData = userDoc.data();

          // Verificăm dacă utilizatorul nu a completat răspunsurile (responses)
          if (!userData.responses) {
            if (
              userData.privacySettings &&
            userData.privacySettings.emailPromotions === false
            ) {
              console.log(
                  `Skip responses reminder ${userData.email}`,
              );
              return;
            }

            const email = userData.email;
            const username = userData.username;
            const targetLanguage = userData.targetLanguage || "ro";

            let emailSubject = "";
            let emailMessage = "";

            if (targetLanguage === "en") {
              emailSubject = "Complete Your Compatibility Quiz";
              emailMessage =
              `[EN]\nHello ${username},\n\n` +
              `It seems you haven't completed your compatibility quiz yet. ` +
              `Please log in and fill out the quiz here: https://www.ydestiny.com/ro/quiz\n\n` +
              `To manage your email preferences or unsubscribe, please visit: https://www.ydestiny.com/profil-client\n\n` +
              `Best regards,\nThe Destiny Team`;
            } else {
              emailSubject = "Completează chestionarul de compatibilitate";
              emailMessage =
              `[RO]\nSalut ${username},\n\n` +
              `Observăm că nu ai completat chestionarul de compatibilitate. ` +
              `Te rugăm să te loghezi și să îl completezi accesând: https://www.ydestiny.com/ro/quiz\n\n` +
              `Pentru a gestiona preferințele tale de email sau pentru a te dezabona, accesează: https://www.ydestiny.com/profil-client\n\n` +
              `--------------------------------------------------\n\n` +
              `[EN]\nHello ${username},\n\n` +
              `It seems you haven't completed your compatibility quiz yet. ` +
              `Please log in and fill out the quiz here: https://www.ydestiny.com/ro/quiz\n\n` +
              `To manage your email preferences or unsubscribe, please visit: https://www.ydestiny.com/profil-client\n\n` +
              `Best regards,\nThe Destiny Team`;
            }

            const mailOptions = {
              from: "contact@ydestiny.com",
              to: email,
              subject: emailSubject,
              text: emailMessage,
            };

            try {
              await transporter.sendMail(mailOptions);
              console.log(`Missing responses reminder sent to: ${email}`);
            } catch (error) {
              console.error("Error sending quiz reminder to", email, error);
            }
          }
        });
      } catch (error) {
        console.error("Error querying users for missing responses:", error);
      }
      return null;
    });


// === SEND NEW COMPATIBILITY EMAIL ===
exports.sendNewCompatibilityEmail = functions.firestore
    .document("Users/{userId}/Compatibilitati/{compatId}")
    .onCreate(async (snap, context) => {
      const userId = context.params.userId;

      try {
        const userDocRef = db.collection("Users").doc(userId);
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) {
          console.error("User document does not exist for userId", userId);
          return null;
        }
        const userData = userDoc.data();

        if (
          userData.privacySettings &&
        userData.privacySettings.emailCompatibility === false
        ) {
          console.log(`Skip new comp email ${userData.email}`);
          return null;
        }

        // Verificăm dacă a fost trimis deja un email astăzi
        const lastEmailTimestamp = userData.lastCompatibilityEmailSent;
        const now = new Date();
        if (lastEmailTimestamp) {
          const lastEmailDate = lastEmailTimestamp.toDate ?
          lastEmailTimestamp.toDate() :
          new Date(lastEmailTimestamp);
          if (
            lastEmailDate.getFullYear() === now.getFullYear() &&
          lastEmailDate.getMonth() === now.getMonth() &&
          lastEmailDate.getDate() === now.getDate()
          ) {
            console.log(`Email already sent to ${userData.email}.`);
            return null;
          }
        }

        // Construiește conținutul emailului
        const email = userData.email;
        const username = userData.username;
        const targetLanguage = userData.targetLanguage || "ro";
        let emailSubject = "";
        let emailMessage = "";
        if (targetLanguage === "en") {
          emailSubject = "You Have a New Compatibility";
          emailMessage =
          `[EN]\nHello ${username},\n\n` +
          `You have a new compatibility match on Destiny! ` +
          `Please log in to view your new match and details.\n\n` +
          `https://www.ydestiny.com/ro/login\n\n` +
          `To manage your email preferences or unsubscribe, please visit: https://www.ydestiny.com/profil-client\n\n` +
          `Best regards,\nThe Destiny Team`;
        } else {
          emailSubject = "Ai o nouă compatibilitate";
          emailMessage =
          `[RO]\nSalut ${username},\n\n` +
          `Ai primit o nouă compatibilitate pe Destiny! ` +
          `Te rugăm să te loghezi ` +
          `pentru a verifica detaliile compatibilității.\n\n` +
          `https://www.ydestiny.com/ro/login\n\n` +
          `Pentru a gestiona preferințele tale de email sau pentru a te dezabona, accesează: https://www.ydestiny.com/profil-client\n\n` +
          `--------------------------------------------------\n\n` +
          `[EN]\nHello ${username},\n\n` +
          `You have a new compatibility match on Destiny! ` +
          `Please log in to view your new match and details.\n\n` +
          `https://www.ydestiny.com/ro/login\n\n` +
          `To manage your email preferences or unsubscribe, please visit: https://www.ydestiny.com/profil-client\n\n` +
          `Best regards,\nThe Destiny Team`;
        }

        const mailOptions = {
          from: "contact@ydestiny.com",
          to: email,
          subject: emailSubject,
          text: emailMessage,
        };

        // Trimiterea emailului
        await transporter.sendMail(mailOptions);
        console.log(`New compatibility email sent to ${email}`);

        // Actualizează emailul
        const lastCompSent = admin.firestore.FieldValue.serverTimestamp();
        await userDocRef.update({
          lastCompatibilityEmailSent: lastCompSent,
        });
      } catch (error) {
        console.error("Error new compatibility email user", userId, error);
      }
      return null;
    });

exports.sendMissingImagesReminder = functions.pubsub
    // Programare: la ora 9:00 AM, la fiecare 3 zile (poți ajusta după necesitate)
    .schedule("0 9 */3 * *")
    .onRun(async (context) => {
      try {
        const usersSnapshot = await db.collection("Users").get();

        // Parcurgem fiecare utilizator
        usersSnapshot.forEach(async (userDoc) => {
          const userData = userDoc.data();

          // Dacă utilizatorul are setate privacySettings care dezactivează emailurile promoționale, sărim peste el
          if (
            userData.privacySettings &&
            userData.privacySettings.emailPromotions === false
          ) {
            console.log(`Skip missing images reminder for ${userData.email}`);
            return;
          }

          // Verificăm dacă utilizatorul nu are imagini adăugate
          if (
            !userData.images ||
            !Array.isArray(userData.images) ||
            userData.images.length === 0
          ) {
            const email = userData.email;
            const username = userData.username;
            const targetLanguage = userData.targetLanguage || "ro";

            let emailSubject = "";
            let emailMessage = "";

            if (targetLanguage === "en") {
              emailSubject = "Add Your Profile Images for Better Compatibility";
              emailMessage =
                `[EN]\nHello ${username},\n\n` +
                `We noticed that you haven't added any profile images yet. Adding images can greatly increase your chances of receiving compatibility matches.\n\n` +
                `Please log in to update your profile: https://www.ydestiny.com/profil-client\n\n` +
                `If you wish to manage your email preferences or unsubscribe, please visit the profile settings page.\n\n` +
                `Best regards,\nThe Destiny Team`;
            } else {
              emailSubject = "Adaugă imagini în profilul tău pentru mai multe compatibilități";
              emailMessage =
                `[RO]\nSalut ${username},\n\n` +
                `Observăm că nu ai adăugat imagini în profilul tău. Adăugarea imaginilor poate crește semnificativ șansele de a primi compatibilități.\n\n` +
                `Te rugăm să te loghezi și să îți actualizezi profilul aici: https://www.ydestiny.com/profil-client\n\n` +
                `Dacă dorești să gestionezi preferințele emailurilor sau să te dezabonezi, accesează setările profilului.\n\n` +
                `Toate cele bune,\nEchipa Destiny`;
            }

            const mailOptions = {
              from: "contact@ydestiny.com",
              to: email,
              subject: emailSubject,
              text: emailMessage,
            };

            try {
              await transporter.sendMail(mailOptions);
              console.log(`Missing images reminder sent to: ${email}`);
            } catch (error) {
              console.error("Error sending missing images reminder to", email, error);
            }
          }
        });
      } catch (error) {
        console.error("Error querying users for missing images:", error);
      }
      return null;
    });

exports.sendUnseenMessagesReminder = functions.pubsub
    // Rulează la ora 10:00 AM, la fiecare 2 zile
    .schedule("0 10 */2 * *")
    .onRun(async (context) => {
      try {
        // Obiect în care reținem userIds care au mesaje nevăzute
        const usersWithUnseen = {};

        // Obținem toate documentele din colecția "Chats"
        const chatsSnapshot = await db.collection("Chats").get();

        // Pentru fiecare document de chat (format "uid1-uid2")
        for (const chatDoc of chatsSnapshot.docs) {
          const chatId = chatDoc.id;
          const parts = chatId.split("-");
          if (parts.length !== 2) continue; // sărim peste documentele care nu respectă formatul

          // Obținem mesajele din subcolecția "Messages" a acestui chat
          const messagesSnapshot = await chatDoc.ref.collection("Messages").get();
          messagesSnapshot.forEach((msgDoc) => {
            const msgData = msgDoc.data();
            // Dacă există receiverId și statusul nu este "seen", marcăm utilizatorul
            if (msgData.receiverId && msgData.status !== "seen") {
              usersWithUnseen[msgData.receiverId] = true;
            }
          });
        }

        // Pentru fiecare utilizator identificat ca având mesaje nevăzute
        for (const userId in usersWithUnseen) {
          if (!Object.prototype.hasOwnProperty.call(usersWithUnseen, userId)) continue;
          const userDocRef = db.collection("Users").doc(userId);
          const userDoc = await userDocRef.get();
          if (!userDoc.exists) continue;

          const userData = userDoc.data();

          // Respectăm preferințele: dacă utilizatorul a dezactivat notificările de mesaje noi
          if (
            userData.privacySettings &&
            userData.privacySettings.emailChatNotifications === false
          ) {
            console.log(`Skipping unseen messages email for ${userData.email}`);
            continue;
          }

          // Verificăm dacă un email de remindere pentru mesaje nevăzute a fost deja trimis astăzi
          const lastEmailTimestamp = userData.lastUnseenMessagesReminderSent;
          const now = new Date();
          if (lastEmailTimestamp) {
            const lastEmailDate = lastEmailTimestamp.toDate ?
              lastEmailTimestamp.toDate() :
              new Date(lastEmailTimestamp);
            if (
              lastEmailDate.getFullYear() === now.getFullYear() &&
              lastEmailDate.getMonth() === now.getMonth() &&
              lastEmailDate.getDate() === now.getDate()
            ) {
              console.log(`Email already sent to ${userData.email} today, skipping.`);
              continue;
            }
          }

          // Construim conținutul emailului în funcție de limba utilizatorului
          const email = userData.email;
          const username = userData.username;
          const targetLanguage = userData.targetLanguage || "ro";
          let emailSubject = "";
          let emailMessage = "";

          if (targetLanguage === "en") {
            emailSubject = "You have new unseen messages on Destiny";
            emailMessage =
              `[EN]\nHello ${username},\n\n` +
              `You have new unseen messages waiting for you on Destiny. Log in now to check them out: https://www.ydestiny.com/ro/login\n\n` +
              `If you wish to manage your email preferences or unsubscribe, please visit your profile settings.\n\n` +
              `Best regards,\nThe Destiny Team`;
          } else {
            emailSubject = "Ai mesaje noi nesăzute pe Destiny";
            emailMessage =
              `[RO]\nSalut ${username},\n\n` +
              `Ai mesaje noi care nu au fost văzute pe Destiny. Te rugăm să te loghezi pentru a le verifica: https://www.ydestiny.com/ro/login\n\n` +
              `Dacă dorești să gestionezi preferințele emailurilor sau să te dezabonezi, accesează setările profilului.\n\n` +
              `Toate cele bune,\nEchipa Destiny`;
          }

          const mailOptions = {
            from: "contact@ydestiny.com",
            to: email,
            subject: emailSubject,
            text: emailMessage,
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`Unseen messages email sent to ${email}`);
            // Actualizăm documentul utilizatorului cu timestamp-ul trimiterii emailului
            await userDocRef.update({
              lastUnseenMessagesReminderSent: admin.firestore.FieldValue.serverTimestamp(),
            });
          } catch (error) {
            console.error("Error sending unseen messages email to", email, error);
          }
        }

        return null;
      } catch (error) {
        console.error("Error in sendUnseenMessagesReminder function:", error);
        return null;
      }
    });


// SUBSCRIPTIONS

// Trimite email promoțional săptămânal (ex: în fiecare Luni la ora 12:00)
exports.sendSubscriptionPromotionEmail = functions
    .runWith({
      timeoutSeconds: 300, // max 5 minute
      memory: "512MB", // sau "1GB", "2GB" etc. dacă e nevoie
    })
    .pubsub
    .schedule("0 12 * * 1") // format crontab: minute ora ziLuna luna ziSaptamana
    .onRun(async (context) => {
      try {
      // 1) Obținem toți utilizatorii
        const usersSnapshot = await db.collection("Users").get();
        const allUsers = usersSnapshot.docs; // array de DocumentSnapshot

        // 2) Definim mărimea unui "lot" (batch)
        const BATCH_SIZE = 50;

        // 3) Împărțim array-ul de useri în loturi
        for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
        // Luăm porțiunea i -> i + BATCH_SIZE
          const batchDocs = allUsers.slice(i, i + BATCH_SIZE);

          // Construim un array de promisiuni pentru emailuri
          const batchPromises = batchDocs.map((userDoc) => {
            const userData = userDoc.data();

            // Sărim peste cei care au dezactivat promoțiile
            if (
              userData.privacySettings &&
            userData.privacySettings.emailPromotions === false
            ) {
              console.log(
                  `Skipping promo for ${userData.email} (promotions off).`,
              );
              return null; // nu facem nimic
            }

            // Trimitem doar la userii fără subscriptionActive
            if (!userData.subscriptionActive) {
              const email = userData.email;
              if (!email) return null;

              const username = userData.username || "Dragă utilizator";
              const targetLanguage = userData.targetLanguage || "ro";

              let emailSubject = "";
              let emailMessage = "";

              if (targetLanguage === "en") {
                emailSubject = "Enjoy Premium Features for Only 5 EUR/Month!";
                emailMessage = `
Hello ${username},

Did you know you can get much more out of Destiny with a Premium subscription for only 5 EUR/month? Unlock these exclusive benefits:

• Priority visibility of your profile
• Unlimited access to daily and monthly compatibilities
• See who viewed your profile
• Unlimited compatibility list
• Advanced chat feature with unlimited messages
• Notifications for new compatibilities
• Exclusive access to personalized compatibility suggestions
• Special badge for Premium users

Upgrade now and enjoy a better, more personalized Destiny experience:
https://www.ydestiny.com/subscriptions

Best regards,
The Destiny Team
`;
              } else {
              // Implicit română
                emailSubject = "Bucură-te de Funcții Premium cu doar 5 EUR/lună!";
                emailMessage = `
Salut ${username},

Știai că poți beneficia mult mai mult de Destiny cu un abonament Premium la doar 5 EUR/lună? Vei avea acces la avantaje exclusive:

• Prioritate în afișarea profilului tău
• Acces nelimitat la compatibilități zilnice și lunare
• Posibilitatea de a vedea cine ți-a vizualizat profilul
• Listă nelimitată de compatibilități
• Funcție de chat avansat cu mesaje nelimitate
• Notificări pentru compatibilități noi
• Acces exclusiv la sugestii personalizate de compatibilitate
• Insignă specială de utilizator premium

Abonează-te acum și bucură-te de o experiență Destiny mai completă și mai personalizată:
https://www.ydestiny.com/subscriptions

Toate cele bune,
Echipa Destiny
`;
              }

              // Construim mailOptions
              const mailOptions = {
                from: "contact@ydestiny.com",
                to: email,
                subject: emailSubject,
                text: emailMessage,
              };

              // Returnăm promisiunea de trimitere
              return transporter.sendMail(mailOptions).then(() => {
                console.log(`Promo subscription email sent to: ${email}`);
              }).catch((err) => {
                console.error(
                    `Error sending promo subscription email to ${email}:`, err,
                );
              });
            } else {
              return null;
            }
          });

          // 4) Așteptăm finalizarea *lotului* curent
          await Promise.all(batchPromises);

          console.log(`Batch [${i}..${i + BATCH_SIZE - 1}] processed.`);
        }

        console.log("Subscription Promotion Email Batch Complete.");
      } catch (error) {
        console.error("Error in sendSubscriptionPromotionEmail:", error);
      }
      return null;
    });
