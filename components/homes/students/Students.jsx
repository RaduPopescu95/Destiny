"use client";

import Image from "next/image";
import React from "react";
import { students } from "../../../data/students";

export default function Students({ location, validUsers }) {
  // Dacă array-ul validUsers este gol, nu afișăm nimic
  if (!validUsers || validUsers.length === 0) {
    return null;
  }

  // Folosim doar primii 10 itemi din datele statice
  const staticStudents = students.slice(0, 10);

  return (
    <section className="layout-pt-lg layout-pb-lg bg-light-4">
      <div className="container">
        {/* Header Section */}
        <div className="row y-gap-15 justify-between items-end">
          <div className="col-lg-6">
            <div className="sectionTitle">
              <h1 className="sectionTitle__title">
                Matrimoniale {location && `${location}`}
              </h1>
            </div>
          </div>
          <div className="col-auto">
            <a
              href="#"
              className="button -icon -outline-purple-1 text-purple-1 fw-500"
            >
              Găsește compatibilitatea ta
              <span className="icon-arrow-top-right text-14 ml-10"></span>
            </a>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="row pt-60 lg:pt-40">
          {staticStudents.map((elm, i) => {
            const user = validUsers[i]; // presupunem că există un user la acest index
            return (
              <div key={i} className="col-lg-3 col-md-4 col-sm-6 col-12 mt-30">
                <div className="teamCard -type-2 bg-white">
                  <div className="teamCard__content">
                    <div className="teamCard__img">
                      <Image
                        width={90}
                        height={90}
                        src={
                          user?.images && user.images.length > 0
                            ? user.images[0].fileUri
                            : elm.imgSrc
                        }
                        alt="imagine"
                        className="rounded-full object-cover stud-image"
                      />
                    </div>
                    <h4 className="teamCard__title text-17 lh-15 fw-500 mt-12">
                      {user?.username}
                    </h4>
                    <div className="teamCard__subtitle text-14 lh-1 mt-5">
                      {user?.aboutMe}
                    </div>
                    <div className="teamCard-tags pt-20">
                      <div className="teamCard-tags__item">
                        <div className="teamCard-tags__tag">
                          {user?.gender}
                        </div>
                      </div>
                      <div className="teamCard-tags__item">
                        <div className="teamCard-tags__tag">
                          {user?.age}
                        </div>
                      </div>
                    </div>
                    <div className="teamCard__button mt-20">
                      <a
                        href="/quiz"
                        className="button -icon -outline-purple-1 -rounded text-purple-1"
                      >
                        Vezi compatibilitatea
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
