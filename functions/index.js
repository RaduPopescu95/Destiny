const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

const Stripe = require("stripe");
const stripe = new Stripe(functions.config().stripe.test_secret_key);


// Funcție care rulează la fiecare 5 minute

// Inițializează Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

// Configurații pentru Nodemailer cu contul de email de pe cPanel
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "webdynamicx@gmail.com",
    pass: "ypeb yvmi ygat lahn",
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
        from: "webdynamicx@gmail.com",
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
          from: "webdynamicx@gmail.com",
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
        const subName = newUser.subName;
        const targetLanguage = newUser.targetLanguage || "ro";

        const emailMessage =
          `[RO]\nBună ${username},\n\n` +
          `Îți mulțumim că te-ai abonat la ${subName} pe Destiny! ` +
          `Prin astrologie și numerologie, Destiny îți va oferi` +
          ` conexiuni compatibile. ` +
          `În curând vei primi profiluri ` +
          `care se potrivesc destinului tău.\n\n` +
          `--------------------------------------------------\n\n` +
          `[EN]\nHello ${username},\n\n` +
          `Thank you for subscribing to ${subName} on Destiny! ` +
          `Destiny leverages astrology and numerology to bring you ` +
          `compatible connections. ` +
          `Soon, you will receive profiles that match your destiny.\n\n` +
          `Best regards,\nThe Destiny Team`;

        let emailSubject = "";
        if (targetLanguage === "nl") {
          emailSubject = `Uw abonnement op ${subName} is geactiveerd!`;
        } else if (targetLanguage === "en") {
          emailSubject = `Your subscription to ${subName} is activated!`;
        } else {
          emailSubject = `Abonamentul tău la ${subName} este activat!`;
        }

        const mailOptions = {
          from: "webdynamicx@gmail.com",
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


exports.sendMissingResponsesReminder = functions.pubsub
    .schedule("0 9 * * *") // Se execută zilnic la ora 9:00 AM
    .onRun(async (context) => {
      try {
        const usersSnapshot = await db.collection("Users").get();

        // Parcurgem fiecare utilizator
        usersSnapshot.forEach(async (userDoc) => {
          const userData = userDoc.data();

          if (!userData.responses) {
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
                `Best regards,\nThe Destiny Team`;
            } else {
              emailSubject = "Completează chestionarul de compatibilitate";
              emailMessage =
                `[RO]\nSalut ${username},\n\n` +
                `Observăm că nu ai completat chestionarul ` +
                `de compatibilitate. ` +
                `Te rugăm să te loghezi și să îl completezi accesând: https://www.ydestiny.com/ro/quiz\n\n` +
                `--------------------------------------------------\n\n` +
                `[EN]\nHello ${username},\n\n` +
                `It seems you haven't completed your compatibility quiz yet. ` +
                `Please log in and fill out the quiz here: https://www.ydestiny.com/ro/quiz\n\n` +
                `Best regards,\nThe Destiny Team`;
            }

            const mailOptions = {
              from: "webdynamicx@gmail.com",
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


exports.sendNewCompatibilityEmail = functions.firestore
    .document("Users/{userId}/Compatibilitati/{compatId}")
    .onCreate(async (snap, context) => {
      const userId = context.params.userId;

      try {
        const userDoc = await db.collection("Users").doc(userId).get();
        if (!userDoc.exists) {
          console.error("User document does not exist for userId", userId);
          return null;
        }
        const userData = userDoc.data();
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
            `Best regards,\nThe Destiny Team`;
        } else {
          emailSubject = "Ai o nouă compatibilitate";
          emailMessage =
            `[RO]\nSalut ${username},\n\n` +
            `Ai primit o nouă compatibilitate pe Destiny! ` +
            `Te rugăm să te loghezi pentru a verifica \n\n` +
            `detaliile compatibilității.\n\n` +
            `--------------------------------------------------\n\n` +
            `[EN]\nHello ${username},\n\n` +
            `You have a new compatibility match on Destiny! ` +
            `Please log in to view your new match and details.\n\n` +
            `Best regards,\nThe Destiny Team`;
        }

        const mailOptions = {
          from: "webdynamicx@gmail.com",
          to: email,
          subject: emailSubject,
          text: emailMessage,
        };

        await transporter.sendMail(mailOptions);
        console.log(`New compatibility email sent to ${email}`);
      } catch (error) {
        console.error("Error sending new comp email for user", userId, error);
      }
      return null;
    });
