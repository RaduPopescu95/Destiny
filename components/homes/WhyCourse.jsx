import React from "react";
import { steps } from "../../data/steps";

export default function WhyCourse({ translatedLinks }) {
  return (
    <section className="layout-pt-lg layout-pb-lg bg-dark-2">
      <div className="container">
        <div className="row justify-center text-center">
          <div className="col-auto">
            <div className="sectionTitle">
              <h2
                className="sectionTitle__title text-white"
                data-aos="fade-up"
                data-aos-duration={800}
              >
                {translatedLinks.whyComponent}?
              </h2>
              {/* Poți adăuga și un paragraf explicativ dacă este necesar */}
            </div>
          </div>
        </div>

        <div className="row y-gap-30 pt-50">
          <div
            className="col-lg-4 col-md-6"
            data-aos="fade-up"
            data-aos-duration={400}
          >
            <div className="stepCard -type-1 -stepCard-hover">
              <div className="stepCard__content">
                <div className="stepCard__icon">
                  <i className={steps[0].icon}></i>
                </div>
                <h4 className="stepCard__title">{translatedLinks.stepsComponent}</h4>
                <p className="stepCard__text">{translatedLinks.stepsComponent1_1}</p>
              </div>
            </div>
          </div>

          <div
            className="col-lg-4 col-md-6"
            data-aos="fade-up"
            data-aos-duration={800}
          >
            <div className="stepCard -type-1 -stepCard-hover">
              <div className="stepCard__content">
                <div className="stepCard__icon">
                  <i className={steps[1].icon}></i>
                </div>
                <h4 className="stepCard__title">{translatedLinks.stepsComponent2}</h4>
                <p className="stepCard__text">{translatedLinks.stepsComponent2_1}</p>
              </div>
            </div>
          </div>

          <div
            className="col-lg-4 col-md-6"
            data-aos="fade-up"
            data-aos-duration={1200}
          >
            <div className="stepCard -type-1 -stepCard-hover">
              <div className="stepCard__content">
                <div className="stepCard__icon">
                  <i className={steps[2].icon}></i>
                </div>
                <h4 className="stepCard__title">{translatedLinks.stepsComponent3}</h4>
                <p className="stepCard__text">{translatedLinks.stepsComponent3_1}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
