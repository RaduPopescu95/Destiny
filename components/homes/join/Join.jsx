import React from "react";
import Link from "next/link";
export default function Join({translatedLinks}) {
  return (
    <section className="layout-pt-md layout-pb-md bg-dark-1">
      <div className="container">
        <div className="row y-gap-20 justify-between items-center">
          <div className="col-xl-4 col-lg-5">
            <h2 className="text-30 lh-15 text-white">
              {translatedLinks.joinText1}{" "}
              <span className="text-green-1">{translatedLinks.joinText2}</span> {translatedLinks.joinText3}{" "}
            </h2>
          </div>

          <div className="col-auto">
            <Link href="#" className="button -md -amourpurple-1 text-dark-1">
            {translatedLinks.joinText4}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
