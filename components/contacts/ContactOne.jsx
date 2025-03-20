"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase"; // Asigură-te că acest fișier exportă instanța Firestore
import { contactData } from "@/data/contactLinks";

const MapComponent = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function ContactOne() {
  const [showMap, setShowMap] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setShowMap(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    // Extragem datele din formular
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const email = formData.get("email");
    const comment = formData.get("comment");

    try {
      await addDoc(collection(db, "contactMessages"), {
        name,
        email,
        comment,
        createdAt: new Date(),
      });
      setSuccess(true);
      e.target.reset(); // Resetează formularul după trimitere
    } catch (err) {
      console.error("Eroare la adăugarea documentului: ", err);
      setError("Eroare la trimiterea mesajului. Te rugăm încearcă din nou.");
    }
    setSubmitting(false);
  };

  return (
    <>
      <section className="layout-pt-md layout-pb-lg pt-90">
        <div className="container">
          <div className="row y-gap-50 justify-between">
            <div className="col-lg-4">
              <h3 className="text-24 fw-500">Rămâi conectat cu Destiny.</h3>
              <p className="mt-25">
                Explorează-ți drumul spiritual și descoperă conexiuni autentice. Fii parte din comunitatea noastră dedicată compatibilității spirituale.
              </p>

              <div className="y-gap-30 pt-60 lg:pt-40">
                {contactData.map((elm, i) => (
                  <div key={i} className="d-flex items-center">
                    <div className="d-flex justify-center items-center size-60 rounded-full bg-light-7">
                      <Image width={30} height={30} src={elm.icon} alt="icon" />
                    </div>
                    <div className="ml-20">
                      {elm.address
                        ? `${elm.address
                            .split(" ")
                            .slice(0, 4)
                            .join(" ")} \n ${elm.address
                            .split(" ")
                            .slice(4, -1)
                            .join(" ")}`
                        : elm.email || elm.phoneNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-7">
              <h3 className="text-24 fw-500">Trimite-ne un mesaj.</h3>
              <p className="mt-25">
                Spune-ne despre experiențele tale spirituale și întrebările care te preocupă. Suntem aici să te ghidăm spre o compatibilitate autentică.
              </p>

              <form
                className="contact-form row y-gap-30 pt-60 lg:pt-40"
                onSubmit={handleSubmit}
              >
                <div className="col-md-6">
                  <label className="text-16 lh-1 fw-500 text-dark-1 mb-10">
                    Nume
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    placeholder="Nume..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="text-16 lh-1 fw-500 text-dark-1 mb-10">
                    Adresă de Email
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="Email..."
                  />
                </div>
                <div className="col-12">
                  <label className="text-16 lh-1 fw-500 text-dark-1 mb-10">
                    Mesaj
                  </label>
                  <textarea
                    required
                    name="comment"
                    placeholder="Scrie mesajul tău..."
                    rows="8"
                  ></textarea>
                </div>
                {error && (
                  <div className="col-12">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="col-12">
                    <p className="text-green-500">
                      Mesajul a fost trimis cu succes! Te vom contacta curand
                    </p>
                  </div>
                )}
                <div className="col-12">
                  <button
                    type="submit"
                    name="submit"
                    id="submit"
                    className="button -md -purple-1 text-white"
                    disabled={submitting}
                  >
                    {submitting ? "Se trimite..." : "Trimite Mesaj"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
