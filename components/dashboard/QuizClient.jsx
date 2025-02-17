"use client";

import React, { useEffect, useState } from "react";
import { Range } from "react-range"; // Slider pentru valori multiple
import FooterNine from "../layout/footers/FooterNine";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import FinishedQuizComp from "../common/FinishQuizComp";
import { useAuth } from "@/context/AuthContext";
import {
  firstQuestions,
  questionsSet1,
  questionsSet2,
  questionsSet3,
} from "@/data/quiz";
import {
  firstQuestions as firstQuestionsNL,
  questionsSet1 as questionsSet1NL,
  questionsSet2 as questionsSet2NL,
  questionsSet3 as questionsSet3NL,
} from "@/data/quizNL";
import QuestionWithApiValidation from "./QuestionWithApiValidation";
import { prepareResponses } from "@/utils/quizUtils";
import AlertBox from "../uiElements/AlertBox";
import { useRouter, useSearchParams } from "next/navigation";
import { DotLoader } from "react-spinners";
import DatePicker from "react-datepicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

import "react-datepicker/dist/react-datepicker.css";
import IntroductionQuiz from "./SettingsClient/IntroductionQuiz";
import EvitaRaspuns from "./EvitaRaspuns";
import { translateTextQuiz } from "@/utils/translationUtils";

const getQuestionSetName = () => "firstQuestions";


export default function QuizClient({
  targetLanguage,
  translatedLinks,
  params,
}) {
  const [currentQuestions, setCurrentQuestions] = useState(firstQuestions);
  // const [currentQuestions, setCurrentQuestions] = useState(
  //   targetLanguage === "nl" ? firstQuestionsNL : firstQuestions
  // );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // const [currentQuestions, setCurrentQuestions] = useState(firstQuestions);
  // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [inputAnswers, setInputAnswers] = useState({});
  const [rangeValues, setRangeValues] = useState([]);

  const [progress, setProgress] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const {
    currentUser,
    loading: loadingContext,
    userData,
    setUserData,
  } = useAuth();
  const [answers, setAnswers] = useState({
    firstQuestions,
    questionsSet1,
    questionsSet2,
    questionsSet3,
  });
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [userAge, setUserAge] = useState(null);
  const [selectedDate, setSelectedDate] = useState({});
  const [translatedOptions, setTranslatedOptions] = useState({});
  const [translatedQuestionText, setTranslatedQuestionText] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState({});
  const searchParams = useSearchParams(); // Utilizăm useSearchParams pentru a obține parametrii URL
  const isEditQuiz = searchParams?.get("editQuiz"); // Obținem session_id din URL
  const [showIntroduction, setShowIntroduction] = useState(true);

  // useEffect(() => {
  //   if (targetLanguage === "nl") {
  //     setCurrentQuestions(firstQuestionsNL);
  //   } else {
  //     setCurrentQuestions(firstQuestions);
  //   }
  // }, [targetLanguage]);

  const resetCurrentQuestionState = () => {
    const currentQuestion = currentQuestions[currentQuestionIndex];

    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion.id]:
        currentQuestion.type === "multiple" ? [] : undefined,
    }));

    setInputAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: "",
    }));

    if (currentQuestion.type === "range") {
      const min = currentQuestion.validation?.min || 0;
      const max = currentQuestion.validation?.max || 100;

      setRangeValues(currentQuestion.singleValue ? [min] : [min, max]);
    }

    setSelectedDate((prev) => ({
      ...prev,
      [currentQuestion.id]: null,
    }));

    setSelectedDateRange((prev) => ({
      ...prev,
      [currentQuestion.id]: { startDate: null, endDate: null },
    }));

    // Elimină selecția „Je préfère ne pas répondre à la question”
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion.id]: [],
    }));
  };

  const startQuiz = () => {
    setShowIntroduction(false);
  };

  const router = useRouter();

  const handleDateChange = (date) => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    console.log("date,,,,", date);
    setSelectedDate((prev) => ({
      ...prev,
      [currentQuestion.id]: date,
    }));
  };

  const handleDateRangeChange = (range) => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    setSelectedDateRange((prev) => ({
      ...prev,
      [currentQuestion.id]: range,
    }));
  };

  useEffect(() => {
    console.log("targetLanguage...", targetLanguage);
    console.log("is editing quiz...", isEditQuiz);
    if (isEditQuiz) {
      setIsRedirecting(false);
      return;
    }
    if (!loadingContext && !userData?.username) {
      console.log("no userData...", userData?.username);
      router.push("/signup");
    }
    if (!loadingContext && userData?.responses) {
      router.push("/profil-client");
    }
    // if (!loadingContext && userData?.reservation?.hasReserved) {
    //   router.push("/profil-client");
    // }
    // if (!loadingContext && userData?.reservation?.status !== "paid") {
    //   router.push("/pricing");
    // }
    setIsRedirecting(false);
  }, [loadingContext]);

  const saveResponsesToFirestore = async (userId, userAnswers) => {
    try {
      // Construim structura de răspunsuri doar pentru "firstQuestions"
      const preparedResponses = prepareResponses(
        [{ name: "firstQuestions", questions: firstQuestions }],
        userAnswers
      );
      const filteredResponses = {
        firstQuestions: preparedResponses.firstQuestions,
      };
  
      // Actualizează documentul utilizatorului în Firestore
      const userDocRef = doc(db, "Users", userId);
      await updateDoc(userDocRef, { responses: filteredResponses });
  
      console.log("Răspunsurile salvate cu succes:", filteredResponses);
    } catch (error) {
      console.error("Eroare la salvarea răspunsurilor:", error);
    }
  };
  

  const handleOptionChange = (option) => {
    const currentQuestion = currentQuestions[currentQuestionIndex];

    setSelectedOptions((prev) => {
      const options = prev[currentQuestion.id] || [];

      // if (currentQuestion.type === "multiple") {
      //   // Gestionăm opțiunea "custom" pentru multiple
      //   if (option === "custom") {
      //     return {
      //       ...prev,
      //       [currentQuestion.id]: options.includes("autre")
      //         ? options // Dacă "custom" este deja selectat, nu facem nimic
      //         : [...options, "custom"], // Adăugăm "custom" la selecții
      //     };
      //   }

      //   // Gestionăm alte opțiuni pentru multiple
      //   return {
      //     ...prev,
      //     [currentQuestion.id]: options.includes(option)
      //       ? options.filter((o) => o !== option) // Eliminăm opțiunea existentă
      //       : [...options, option], // Adăugăm opțiunea la selecții
      //   };
      // }

      if (currentQuestion.type === "multiple") {
        // Gestionăm opțiunea "custom" pentru multiple
        if (option === "custom") {
          return {
            ...prev,
            [currentQuestion.id]: options.includes("autre")
              ? options // Dacă "custom" este deja selectat, nu facem nimic
              : [...options, "custom"], // Adăugăm "custom" la selecții
          };
        }

        // Eliminăm "Je préfère ne pas répondre à la question" dacă există
        const filteredOptions = options.filter(
          (o) => o !== "Je préfère ne pas répondre à la question"
        );

        // Gestionăm alte opțiuni pentru multiple
        return {
          ...prev,
          [currentQuestion.id]: filteredOptions.includes(option)
            ? filteredOptions.filter((o) => o !== option) // Eliminăm opțiunea existentă
            : [...filteredOptions, option], // Adăugăm opțiunea la selecții
        };
      }

      if (currentQuestion.type === "single") {
        // Resetează inputul personalizat dacă altă opțiune decât "autre" este selectată
        if (option !== "autre") {
          setInputAnswers((prevInput) => ({
            ...prevInput,
            [`autre_${currentQuestion.id}`]: "", // Resetăm valoarea inputului
          }));
        }
      }

      // Gestionăm întrebările de tip single
      return {
        ...prev,
        [currentQuestion.id]: option,
      };
    });
  };

  const handleCustomInputChange = (e) => {
    const { value } = e.target;
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const questionId = currentQuestion.id;

    setInputAnswers((prev) => ({
      ...prev,
      [`autre_${questionId}`]: value, // Salvează răspunsul personalizat
    }));

    setSelectedOptions((prev) => {
      if (currentQuestion.type === "multiple") {
        // Gestionăm pentru întrebări multiple
        const updatedOptions = (prev[questionId] || []).filter(
          (opt) => !opt.startsWith("autre:")
        );
        if (value.trim() !== "") {
          updatedOptions.push(`autre: ${value}`);
        }
        console.log("..........", { ...prev, [questionId]: updatedOptions });
        return { ...prev, [questionId]: updatedOptions };
      } else {
        // Gestionăm pentru întrebări single
        console.log("..........", {
          ...prev,
          [questionId]: value.trim() ? `autre: ${value}` : "", // Înlocuiește răspunsul existent
        });
        return {
          ...prev,
          [questionId]: value.trim() ? `autre: ${value}` : "", // Înlocuiește răspunsul existent
        };
      }
    });
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    const currentQuestion = currentQuestions[currentQuestionIndex];
    setInputAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const validateCurrentAnswer = (currentQuestion) => {
    console.log("verificare....validate answer", selectedOptions);

    console.log("verificare....currentQuestion", currentQuestion);
    console.log("verificare....currentQuestion", currentQuestion.type);

    let isValid = false;

    if (
      selectedOptions[currentQuestion.id]?.includes(
        "Je préfère ne pas répondre à la question"
      )
    ) {
      isValid = true;
    } else if (currentQuestion.type === "multiple") {
      console.log("verificare....multiple", selectedOptions);
      isValid = selectedOptions[currentQuestion.id]?.length > 0;
    } else if (
      currentQuestion.type === "single" ||
      currentQuestion.type === "image-selection"
    ) {
      console.log("verificare....single", selectedOptions);
      console.log("verificare....single", selectedOptions[currentQuestion.id]);
      isValid = selectedOptions[currentQuestion.id]?.length > 0;
    } else if (currentQuestion.type === "input") {
      console.log("verificare....input", selectedOptions[currentQuestion.id]);
      isValid = !!inputAnswers[currentQuestion.id]?.trim();
    } else if (currentQuestion.type === "date-picker") {
      console.log(
        "verificare....date-picker",
        selectedOptions[currentQuestion.id]
      );
      isValid = !!selectedDate[currentQuestion.id];
    } else if (currentQuestion.type === "date-range-picker") {
      console.log(
        "verificare....date-range-picker",
        selectedOptions[currentQuestion.id]
      );
      const range = selectedDateRange[currentQuestion.id];
      isValid = range && range.startDate && range.endDate;
    } else if (currentQuestion.type === "range") {
      console.log("verificare....range", selectedOptions[currentQuestion.id]);
      isValid = true;
    } else if (currentQuestion.type === "single") {
      console.log("verificare....single", selectedOptions);
      isValid = !!selectedOptions;
    }

    if (!isValid) {
      setAlertMessage("Veuillez répondre à la question avant de continuer.");
      setShowAlert(true);
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log("userAge...", userAge);
    console.log("Final selected options:", selectedOptions);
    console.log("Final input answers:", inputAnswers);
  
    const currentQuestion = currentQuestions[currentQuestionIndex];
    let selectedAnswer;
  
    if (!validateCurrentAnswer(currentQuestion)) {
      console.log("Answer validation failed.");
      return;
    }
  
    // Determinăm răspunsul în funcție de tipul întrebării
    if (selectedOptions[currentQuestion.id]?.includes("Je préfère ne pas répondre à la question")) {
      selectedAnswer = "Je préfère ne pas répondre à la question";
    } else if (currentQuestion.type === "date-picker") {
      selectedAnswer = selectedDate[currentQuestion.id];
      if (!selectedAnswer) {
        setAlertMessage(translatedLinks.selectedAnswerText);
        setShowAlert(true);
        return;
      }
    } else if (currentQuestion.type === "input") {
      // Pentru întrebările de tip "input", răspunsul este preluat ca string
      selectedAnswer = inputAnswers[currentQuestion.id];
      if (!selectedAnswer) {
        setAlertMessage(translatedLinks.selectedAnswerText);
        setShowAlert(true);
        return;
      }
    } else if (currentQuestion.type === "range") {
      selectedAnswer = currentQuestion.singleValue
        ? rangeValues[0]
        : { min: rangeValues[0], max: rangeValues[1] };
      if (!selectedAnswer) {
        setAlertMessage(translatedLinks.selectedAnswerText);
        setShowAlert(true);
        return;
      }
    } else if (currentQuestion.type === "multiple") {
      selectedAnswer = selectedOptions[currentQuestion.id] || [];
      if (selectedAnswer.length === 0) {
        setAlertMessage(translatedLinks.selectOneOptionText);
        setShowAlert(true);
        return;
      }
    } else if (currentQuestion.type === "image-selection") {
      selectedAnswer = selectedOptions[currentQuestion.id];
      if (!selectedAnswer) {
        setAlertMessage(translatedLinks.selectedAnswerText);
        setShowAlert(true);
        return;
      }
    } else {
      selectedAnswer = selectedOptions[currentQuestion.id];
      if (!selectedAnswer) {
        setAlertMessage(translatedLinks.selectedAnswerText);
        setShowAlert(true);
        return;
      }
    }
  
    // Creează local un nou obiect cu răspunsul actualizat
    const updatedAnswers = {
      ...answers,
      firstQuestions: (answers.firstQuestions || []).map((q) =>
        q.id === currentQuestion.id ? { ...q, answer: selectedAnswer } : q
      ),
    };
  
    // Actualizează starea locală (opțional, pentru sincronizare)
    setAnswers(updatedAnswers);
  
    // Trecem la următoarea întrebare sau finalizăm chestionarul
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < currentQuestions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setProgress(((nextQuestionIndex + 1) / currentQuestions.length) * 100);
      resetCurrentQuestionState();
    } else {
      // Finalizare chestionar: salvăm răspunsurile din firstQuestions
      if (userData?.uid) {
        try {
          // Nu mai folosim "answers", ci obiectul local "updatedAnswers"
          const filteredResponses = {
            firstQuestions: updatedAnswers.firstQuestions,
          };
  
          const userDocRef = doc(db, "Users", userData.uid);
          const dataToSave = { responses: filteredResponses };
          if (userAge !== null) {
            dataToSave.age = userAge;
          }
          let userDb = userData;
          userDb.responses = filteredResponses;
          setUserData(userDb);
          console.log("Saving responses:", dataToSave);
          await updateDoc(userDocRef, dataToSave);
          console.log("Responses saved successfully:", filteredResponses);
          setQuizFinished(true);
        } catch (error) {
          console.error("Error saving responses:", error);
        }
      } else {
        console.error("User is not authenticated.");
      }
    }
  };
  
  

  const handleNextQuestion = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < currentQuestions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setSelectedOptions((prev) => ({
        ...prev,
        [currentQuestions[nextQuestionIndex]?.id]: [],
      }));
      setProgress(((nextQuestionIndex + 1) / currentQuestions.length) * 100);
      resetCurrentQuestionState();
    } else {
      // Finalizare chestionar: salvăm doar răspunsurile din firstQuestions
      if (userData?.uid) {
        saveResponsesToFirestore(userData.uid, answers);
      } else {
        console.error("Utilizatorul nu este autentificat");
      }
    }
  };
  

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setProgress(
        ((currentQuestionIndex - 1 + 1) / currentQuestions.length) * 100
      );
    }
  };

  const handleValidatedAnswer = (validatedAnswer) => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const questionSetName = getQuestionSetName(currentQuestions);

    // Gestionăm răspunsul pentru întrebarea cu id: 9
    if (currentQuestion.api && currentQuestion.type === "input") {
      const postalCode = validatedAnswer?.split(",")[0]?.trim();
      const city = validatedAnswer?.split(",")[1]?.trim();

      if (!postalCode || !city) {
        console.error("Codul poștal sau orașul sunt invalide.");
        return;
      }

      // Formatăm răspunsul ca string: "city, postalCode"
      const formattedAnswer = `${city}, ${postalCode}`;

      // Adăugăm răspunsul formatat în answers
      setAnswers((prev) => ({
        ...prev,
        [questionSetName]: (prev[questionSetName] || []).map((q) =>
          q.id === currentQuestion.id ? { ...q, answer: formattedAnswer } : q
        ),
      }));

      handleNextQuestion(); // Trecem la următoarea întrebare
      return;
    }

    // Gestionăm cazurile generale
    setAnswers((prev) => ({
      ...prev,
      [questionSetName]: (prev[questionSetName] || []).map((q) =>
        q.id === currentQuestion.id ? { ...q, answer: validatedAnswer } : q
      ),
    }));

    handleNextQuestion(); // Trecem la următoarea întrebare
  };

  const handleDateInputChange = (e) => {
    let { value } = e.target;
    // Eliminăm orice caracter care nu este cifră
    value = value.replace(/[^0-9]/g, "");
    // Adăugăm separatorul "/" după primele 2 și 4 cifre
    if (value.length > 2 && value.length <= 4) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    } else if (value.length > 4) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4, 8)}`;
    }
    
    // Actualizăm starea pentru inputul curent
    const currentQuestion = currentQuestions[currentQuestionIndex];
    setInputAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  
    // Dacă inputul este complet (10 caractere), calculăm vârsta
    if (value.length === 10) {
      const [day, month, year] = value.split("/").map(Number);
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (!isNaN(age) && age >= 0 && age <= 120) {
        setUserAge(age);
      } else {
        setUserAge(null);
      }
    } else {
      setUserAge(null);
    }
  };
  

  const currentQuestion = currentQuestions[currentQuestionIndex];

  useEffect(() => {
    const question = currentQuestions[currentQuestionIndex];

    if (question?.type === "range") {
      const min = question.validation?.min || 30;
      const max = question.validation?.max || 300;

      // Verificăm și setăm explicit valorile
      if (question.singleValue) {
        console.log("Resetting range for single value");
        setRangeValues([min]); // Slider cu o singură valoare
      } else {
        console.log("Resetting range for interval");
        setRangeValues([min, max]); // Slider cu interval
      }
    } else {
      // Dacă întrebarea nu este de tip range, resetează starea
      setRangeValues([]);
    }
  }, [currentQuestionIndex, currentQuestions]);

  // TRADUCERI //

  // const translateText = async (text) => {
  //   if (targetLanguage === "fr") {
  //     console.log("este franceza....intorc franceza");
  //     return text;
  //   } else {
  //     try {
  //       const API_KEY = process.env.GOOGLE_CLOUD_API_KEY; // Asigură-te că această cheie este disponibilă
  //       const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

  //       const response = await fetch(url, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           q: text,
  //           target: targetLanguage,
  //           format: "text",
  //         }),
  //       });

  //       if (!response.ok) {
  //         const errorText = await response.text();
  //         console.error("Eroare la Google API:", errorText);
  //         throw new Error("Translation failed");
  //       }

  //       const data = await response.json();
  //       return data.data.translations[0].translatedText;
  //     } catch (error) {
  //       console.error("Eroare la traducerea textului:", error);
  //       return text; // Returnează textul original ca fallback
  //     }
  //   }
  // };

  const translateQuestionText = async (text) => {
    console.log(`🔵 [translateQuestionText] Încep traducerea: "${text}"`);

    if (targetLanguage === "ro") {
      console.log(
        `🟢 [translateQuestionText] Limba este 'fr', returnez direct textul.`
      );
      setTranslatedQuestionText(text);
      return;
    }

    try {
      const translatedText = await translateTextQuiz(text, targetLanguage);
      console.log(`✅ [translateQuestionText] Tradus: "${translatedText}"`);
      setTranslatedQuestionText(translatedText);
    } catch (error) {
      console.error("❌ [translateQuestionText] Eroare la traducere:", error);
      setTranslatedQuestionText(text); // Fallback la text original
    }
  };

  const translateAndStoreOptions = async (options) => {
    console.log(`🔵 [translateAndStoreOptions] Încep traducerea opțiunilor...`);

    if (targetLanguage === "ro") {
      console.log(
        `🟢 [translateAndStoreOptions] Limba este 'fr', păstrez opțiunile originale.`
      );
      const translations = options.reduce((acc, option) => {
        acc[option] = option;
        return acc;
      }, {});
      setTranslatedOptions(translations);
      return;
    }

    try {
      // Traducem toate opțiunile în paralel
      const translatedOptions = await Promise.all(
        options.map(async (option) => {
          const translatedText = await translateTextQuiz(
            option,
            targetLanguage
          );
          return { original: option, translated: translatedText };
        })
      );

      // Creăm un obiect cu opțiunile traduse
      const translations = translatedOptions.reduce(
        (acc, { original, translated }) => {
          acc[original] = translated;
          return acc;
        },
        {}
      );

      console.log(
        "✅ [translateAndStoreOptions] Opțiuni traduse:",
        translations
      );
      setTranslatedOptions(translations);
    } catch (error) {
      console.error(
        "❌ [translateAndStoreOptions] Eroare la traducere:",
        error
      );
      // Fallback: menținem opțiunile originale
      const fallbackTranslations = options.reduce((acc, option) => {
        acc[option] = option;
        return acc;
      }, {});
      setTranslatedOptions(fallbackTranslations);
    }
  };

  // Apelăm funcțiile de traducere la schimbarea întrebării
  useEffect(() => {
    if (currentQuestion?.text) {
      translateQuestionText(currentQuestion.text);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (currentQuestion?.options?.length > 0) {
      translateAndStoreOptions(currentQuestion.options);
    }
  }, [currentQuestion]);

  // TRADUCERI //

  useEffect(() => {
    resetCurrentQuestionState();
  }, [currentQuestionIndex]);

  // const resetProgress = () => {
  //   localStorage.removeItem("quizProgress");
  //   setCurrentQuestions(firstQuestions);
  //   setCurrentQuestionIndex(0);
  //   setSelectedOptions({});
  //   setInputAnswers({});
  //   setProgress(0);
  // };

  if (quizFinished && isEditQuiz) {
    router.push("/profil-client");
  }
  if (quizFinished && !isEditQuiz) {
    router.push("/pricing");
    return <FinishedQuizComp translatedLinks={translatedLinks} />;
  }

  if (isRedirecting) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <DotLoader color="#c13365" size={60} />
      </div>
    );
  }

  if (showIntroduction) {
    return (
      <IntroductionQuiz onStart={startQuiz} translatedLinks={translatedLinks} />
    );
  }

  return (
    <>
      <div className="dashboard__main pl-0">
        <div className="dashboard__content bg-light-4 pt-20">
          {/* <div className="row pb-20 mb-10">
            <div className="col-auto">
              <h1 className="text-30 lh-12 fw-700">Chestionar</h1>
            </div>
          </div> */}

          <div className="row y-gap-30">
            <div className={showProgressBar ? "col-xl-9" : "col-xl-12"}>
              <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4">
                <div className="py-30 px-30">
                  <div className="row pb-20 mb-10">
                    <div className="col-auto">
                      <h1 className="text-30 lh-12 fw-700">
                        {translatedLinks.chestionarText}
                      </h1>
                    </div>
                  </div>
                  <div className="border-light overflow-hidden rounded-8">
                    <div className="py-40 px-40 bg-dark-5">
                      {/* <h4 className="text-18 lh-1 fw-500 text-white">
                        {translatedLinks.întrebareaText} {currentQuestion.id}
                      </h4> */}
                      <div className="text-20 lh-1 text-white mt-15">
                        {translatedQuestionText || currentQuestion.text}{" "}
                        {/* Tradus sau fallback */}
                      </div>
                    </div>

                    <div className="px-40 py-40">
                      {currentQuestion.type === "date-picker" ? (
                        <>
                          <form onSubmit={handleSubmit}>
                            <div className="form-group">
                              <label>{currentQuestion.text}</label>
                              <DatePicker
                                selected={
                                  selectedDate[currentQuestion.id] || null
                                }
                                onChange={(date) => handleDateChange(date)}
                                showMonthYearPicker
                                dateFormat="MM/yyyy"
                                placeholderText={currentQuestion.placeholder}
                                className="form-control"
                              />
                            </div>
                            {/* <EvitaRaspuns
                              selectedOptions={selectedOptions}
                              currentQuestion={currentQuestion}
                              setSelectedOptions={setSelectedOptions}
                              translatedLinks={translatedLinks}
                            /> */}
                            <div className="d-flex justify-end">
                              {currentQuestionIndex !== 0 && (
                                <button
                                  type="button"
                                  className="button -md -dark-1 text-white -dark-button-white mt-40 mr-10"
                                  onClick={handlePreviousQuestion}
                                >
                                  <FontAwesomeIcon icon={faArrowLeft} />{" "}
                                  {/* Sageata inapoi */}
                                </button>
                              )}
                              <button
                                type="submit"
                                className="button -md -dark-1 text-white -dark-button-white mt-40"
                                disabled={!selectedDate[currentQuestion.id]}
                              >
                                <FontAwesomeIcon icon={faArrowRight} />{" "}
                                {/* Sageata urmator */}
                              </button>
                            </div>
                          </form>
                        </>
                      ) : currentQuestion.type === "date-range-picker" ? (
                        <>
                          <form onSubmit={handleSubmit}>
                            <div className="form-group">
                              <label>{currentQuestion.text}</label>
                              <DatePicker
                                selected={
                                  selectedDateRange[currentQuestion.id]
                                    ?.startDate || null
                                }
                                onChange={(dates) => {
                                  const [start, end] = dates;
                                  handleDateRangeChange({
                                    startDate: start,
                                    endDate: end,
                                  });
                                }}
                                startDate={
                                  selectedDateRange[currentQuestion.id]
                                    ?.startDate || null
                                }
                                endDate={
                                  selectedDateRange[currentQuestion.id]
                                    ?.endDate || null
                                }
                                selectsRange
                                dateFormat="MM/yyyy"
                                placeholderText={currentQuestion.placeholder}
                                className="form-control"
                              />
                            </div>
                            {/* <EvitaRaspuns
                              selectedOptions={selectedOptions}
                              currentQuestion={currentQuestion}
                              setSelectedOptions={setSelectedOptions}
                              translatedLinks={translatedLinks}
                            /> */}
                            <div className="d-flex justify-end">
                              {currentQuestionIndex !== 0 && (
                                <button
                                  type="button"
                                  className="button -md -dark-1 text-white -dark-button-white mt-40 mr-10"
                                  onClick={handlePreviousQuestion}
                                >
                                  <FontAwesomeIcon icon={faArrowLeft} />{" "}
                                  {/* Sageata inapoi */}
                                </button>
                              )}
                              <button
                                type="submit"
                                className="button -md -dark-1 text-white -dark-button-white mt-40"
                                disabled={
                                  !selectedDateRange[currentQuestion.id]
                                    ?.startDate ||
                                  !selectedDateRange[currentQuestion.id]
                                    ?.endDate
                                }
                              >
                                <FontAwesomeIcon icon={faArrowRight} />{" "}
                                {/* Sageata urmator */}
                              </button>
                            </div>
                          </form>
                        </>
                      ) : currentQuestion.type === "image-selection" ? (
                        <>
                          <form onSubmit={handleSubmit}>
                            <div className="image-selection-container">
                              {currentQuestion.options.map((option, index) => (
                                <div
                                  key={index}
                                  className={`image-option ${
                                    selectedOptions[currentQuestion.id] ===
                                    option.image
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    setSelectedOptions((prev) => ({
                                      ...prev,
                                      [currentQuestion.id]: option.image,
                                    }))
                                  }
                                >
                                  <img
                                    src={`/assets/img/${option.image}`}
                                    alt={`Option ${index + 1}`}
                                    className="image-thumbnail"
                                  />
                                </div>
                              ))}
                            </div>
                            {/* <EvitaRaspuns
                              selectedOptions={selectedOptions}
                              currentQuestion={currentQuestion}
                              setSelectedOptions={setSelectedOptions}
                              translatedLinks={translatedLinks}
                            /> */}
                            <div className="d-flex justify-end">
                              {currentQuestionIndex !== 0 && (
                                <button
                                  type="button"
                                  className="button -md -dark-1 text-white -dark-button-white mt-40 mr-10"
                                  onClick={handlePreviousQuestion}
                                >
                                  <FontAwesomeIcon icon={faArrowLeft} />{" "}
                                  {/* Sageata inapoi */}
                                </button>
                              )}
                              <button
                                type="submit"
                                className="button -md -dark-1 text-white -dark-button-white mt-40"
                                disabled={!selectedOptions[currentQuestion.id]}
                              >
                                <FontAwesomeIcon icon={faArrowRight} />{" "}
                                {/* Sageata urmator */}
                              </button>
                            </div>
                          </form>
                        </>
                      ) : currentQuestion.type === "input" &&
                        !currentQuestion.api &&
                        currentQuestion.placeholder !== "dd/MM/yyyy" ? (
                        <>
                          <form onSubmit={handleSubmit}>
                            <div className="form-group">
                              <input
                                type="text"
                                placeholder={currentQuestion.placeholder}
                                value={inputAnswers[currentQuestion.id] || ""}
                                onChange={handleInputChange}
                                className="form-control custom-input"
                              />
                            </div>
                            {/* <EvitaRaspuns
                              selectedOptions={selectedOptions}
                              currentQuestion={currentQuestion}
                              setSelectedOptions={setSelectedOptions}
                              translatedLinks={translatedLinks}
                            /> */}
                            <div className="d-flex justify-end">
                              {currentQuestionIndex != 0 && (
                                <button
                                  type="button"
                                  className="button -md -dark-1 text-white -dark-button-white mt-40 mr-10"
                                  onClick={handlePreviousQuestion}
                                  disabled={currentQuestionIndex === 0}
                                >
                                  <FontAwesomeIcon icon={faArrowLeft} />{" "}
                                  {/* Sageata inapoi */}
                                </button>
                              )}
                              <button
                                type="submit"
                                className="button -md -dark-1 text-white -dark-button-white mt-40"
                              >
                                <FontAwesomeIcon icon={faArrowRight} />{" "}
                                {/* Sageata urmator */}
                              </button>
                            </div>
                          </form>
                        </>
                      ) : currentQuestion.type === "range" &&
                        currentQuestion.singleValue ? (
                        <>
                          <form onSubmit={handleSubmit}>
                            <div className="form-group">
                              {/* Slider pentru o singură valoare */}
                              <Range
                                step={1}
                                min={currentQuestion.validation.min}
                                max={currentQuestion.validation.max}
                                values={rangeValues}
                                onChange={(values) => setRangeValues(values)}
                                renderTrack={({ props, children }) => (
                                  <div
                                    {...props}
                                    className="range-track"
                                    style={{
                                      height: "6px",
                                      background: "#ddd",
                                      borderRadius: "3px",
                                    }}
                                  >
                                    {children}
                                  </div>
                                )}
                                renderThumb={({ props, value }) => (
                                  <div
                                    {...props}
                                    className="range-thumb"
                                    style={{
                                      height: "20px",
                                      width: "20px",
                                      background: "#6c63ff",
                                      borderRadius: "50%",
                                      outline: "none",
                                    }}
                                  >
                                    <div className="value-tooltip">{value}</div>
                                  </div>
                                )}
                              />
                              <div className="range-labels">
                                <span>{rangeValues[0]}</span>
                              </div>
                            </div>
                            {/* <EvitaRaspuns
                              selectedOptions={selectedOptions}
                              currentQuestion={currentQuestion}
                              setSelectedOptions={setSelectedOptions}
                              translatedLinks={translatedLinks}
                            /> */}
                            <div className="d-flex justify-end">
                              {currentQuestionIndex !== 0 && (
                                <button
                                  type="button"
                                  className="button -md -dark-1 text-white -dark-button-white mt-40 mr-10"
                                  onClick={handlePreviousQuestion}
                                  disabled={currentQuestionIndex === 0}
                                >
                                  <FontAwesomeIcon icon={faArrowLeft} />{" "}
                                  {/* Sageata inapoi */}
                                </button>
                              )}
                              <button
                                type="submit"
                                className="button -md -dark-1 text-white -dark-button-white mt-40"
                              >
                                <FontAwesomeIcon icon={faArrowRight} />{" "}
                                {/* Sageata urmator */}
                              </button>
                            </div>
                          </form>
                        </>
                      ) : currentQuestion.type === "range" &&
                        !currentQuestion.singleValue ? (
                        <>
                          <form onSubmit={handleSubmit}>
                            <div className="form-group">
                              {/* Slider pentru interval */}
                              <Range
                                step={1}
                                min={currentQuestion.validation.min}
                                max={currentQuestion.validation.max}
                                values={rangeValues}
                                onChange={(values) => setRangeValues(values)} // Actualizează ambele valori direct
                                renderTrack={({ props, children }) => (
                                  <div
                                    {...props}
                                    className="range-track"
                                    style={{
                                      height: "6px",
                                      background: "#ddd",
                                      borderRadius: "3px",
                                    }}
                                  >
                                    {children}
                                  </div>
                                )}
                                renderThumb={({ props, value, index }) => (
                                  <div
                                    {...props}
                                    className="range-thumb"
                                    style={{
                                      height: "20px",
                                      width: "20px",
                                      background: "#6c63ff",
                                      borderRadius: "50%",
                                      outline: "none",
                                    }}
                                  >
                                    <div className="value-tooltip">{value}</div>
                                  </div>
                                )}
                              />
                              <div className="range-labels">
                                <span>{rangeValues[0]}</span>
                                <span>{rangeValues[1]}</span>
                              </div>
                            </div>

                            {/* <EvitaRaspuns
                              selectedOptions={selectedOptions}
                              currentQuestion={currentQuestion}
                              setSelectedOptions={setSelectedOptions}
                              translatedLinks={translatedLinks}
                            /> */}
                            <div className="d-flex justify-end">
                              {currentQuestionIndex !== 0 && (
                                <button
                                  type="button"
                                  className="button -md -dark-1 text-white -dark-button-white mt-40 mr-10"
                                  onClick={handlePreviousQuestion}
                                  disabled={currentQuestionIndex === 0}
                                >
                                  <FontAwesomeIcon icon={faArrowLeft} />{" "}
                                  {/* Sageata inapoi */}
                                </button>
                              )}
                              <button
                                type="submit"
                                className="button -md -dark-1 text-white -dark-button-white mt-40"
                              >
                                <FontAwesomeIcon icon={faArrowRight} />{" "}
                                {/* Sageata urmator */}
                              </button>
                            </div>
                          </form>
                        </>
                      ) : currentQuestion.api &&
                        currentQuestion.type === "input" ? (
                        <>
                          <QuestionWithApiValidation
                            question={currentQuestion}
                            onValidatedAnswer={handleValidatedAnswer}
                            translatedLinks={translatedLinks}
                          />
                        </>
                      ) : currentQuestion.validation?.type === "date" ? (
                        <>
                          <form onSubmit={handleSubmit}>
                            <div className="form-group">
                              <input
                                type="text"
                                placeholder={
                                  currentQuestion.placeholder || "JJ/MM/AAAA"
                                }
                                value={inputAnswers[currentQuestion.id] || ""}
                                onChange={handleDateInputChange} // Utilizarea funcției pentru gestionarea formatării
                                className="form-control custom-input"
                                maxLength={10} // Limitează lungimea la 10 caractere (dd/MM/yyyy)
                              />
                            </div>
                            {/* <EvitaRaspuns
                              selectedOptions={selectedOptions}
                              currentQuestion={currentQuestion}
                              setSelectedOptions={setSelectedOptions}
                              translatedLinks={translatedLinks}
                            /> */}
                            <div className="d-flex justify-end">
                              {currentQuestionIndex != 0 && (
                                <button
                                  type="button"
                                  className="button -md -dark-1 text-white -dark-button-white mt-40 mr-10"
                                  onClick={handlePreviousQuestion}
                                  disabled={currentQuestionIndex === 0}
                                >
                                  <FontAwesomeIcon icon={faArrowLeft} />{" "}
                                  {/* Sageata inapoi */}
                                </button>
                              )}

                              <button
                                type="submit"
                                className="button -md -dark-1 text-white -dark-button-white mt-40"
                              >
                                <FontAwesomeIcon icon={faArrowRight} />{" "}
                                {/* Sageata urmator */}
                              </button>
                            </div>
                          </form>
                        </>
                      ) : (
                        <>
                          <form onSubmit={handleSubmit}>
                            {/* Mapare opțiuni */}
                            {currentQuestion.options?.map((option, index) => (
                              <div
                                key={index}
                                className="form-radio d-flex items-center mt-20"
                              >
                                <div className="radio">
                                  <input
                                    type={
                                      currentQuestion.type === "multiple"
                                        ? "checkbox"
                                        : "radio"
                                    }
                                    value={option}
                                    checked={
                                      currentQuestion.type === "multiple"
                                        ? selectedOptions[
                                            currentQuestion.id
                                          ]?.includes(option)
                                        : selectedOptions[
                                            currentQuestion.id
                                          ] === option
                                    }
                                    onChange={() => handleOptionChange(option)}
                                  />
                                  <div className="radio__mark">
                                    <div className="radio__icon"></div>
                                  </div>
                                </div>
                                <div className="fw-500 ml-12">
                                  {translatedOptions[option] || option}
                                </div>
                              </div>
                            ))}

                            {/* {currentQuestions.length != 4 && (
                              <EvitaRaspuns
                                selectedOptions={selectedOptions}
                                currentQuestion={currentQuestion}
                                setSelectedOptions={setSelectedOptions}
                                translatedLinks={translatedLinks}
                              />
                            )} */}
                            {/* Afișăm câmpul input pentru "Autre" */}
                            {/* Input pentru "Autre" */}

                            {/* Afișăm câmpul input pentru "Autre" dacă allowsCustom este true */}
                            {currentQuestion.allowsCustom && (
                              <div className="form-group mt-20">
                                <h3>{translatedLinks.autreText}</h3>
                                <input
                                  type="text"
                                  placeholder={
                                    translatedLinks.raspunsPersonalizatText
                                  }
                                  value={
                                    inputAnswers[
                                      `autre_${currentQuestion.id}`
                                    ] || ""
                                  }
                                  onChange={handleCustomInputChange}
                                  className="form-control custom-input"
                                />
                              </div>
                            )}

                            {/* Afișăm câmpul input pentru "Autre" */}

                            <div className="d-flex justify-end">
                              {currentQuestionIndex != 0 && (
                                <button
                                  type="button"
                                  className="button -md -dark-1 text-white -dark-button-white mt-40 mr-10"
                                  onClick={handlePreviousQuestion}
                                  disabled={currentQuestionIndex === 0}
                                >
                                  <FontAwesomeIcon icon={faArrowLeft} />{" "}
                                  {/* Sageata inapoi */}
                                </button>
                              )}
                              <button
                                type="submit"
                                className="button -md -dark-1 text-white -dark-button-white mt-40"
                              >
                                <FontAwesomeIcon icon={faArrowRight} />{" "}
                                {/* Sageata urmator */}
                              </button>
                            </div>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-between items-center mt-40"></div>
              </div>
            </div>

            {showProgressBar && (
              <div className="col-xl-3 col-lg-3">
                <div className="row y-gap-30">
                  <div className="col-12">
                    <div className="pt-20 pb-30 px-30 rounded-16 bg-white -dark-bg-dark-1 shadow-4">
                      <h5 className="text-17 fw-500 mb-30">
                        {translatedLinks.progresText}
                      </h5>
                      <div className="d-flex items-center">
                        <div className="progress-bar w-1/1">
                          <div className="progress-bar__bg bg-light-3"></div>
                          <div
                            className="progress-bar__bar bg-purple-1"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="d-flex y-gap-10 justify-between items-center ml-15">
                          <div>{progress.toFixed(0)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <FooterNine />
      </div>
      {showAlert && (
        <AlertBox
          type="danger"
          message={alertMessage}
          showAlert={showAlert}
          onClose={() => setShowAlert(false)}
        />
      )}
    </>
  );
}
