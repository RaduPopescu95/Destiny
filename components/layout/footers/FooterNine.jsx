import React from "react";
import Links from "../component/Links";

export default function FooterNine() {
  return (
    <footer className="footer footer-bg-color">
      <div className="container">
        <div className="py-30">
          <div className="row items-center justify-between">
            <div className="col-auto">
              <div className="text-13 text-white-1 lh-1">
                © {new Date().getFullYear()} Destiny. Toate drepturile
                rezervate.
              </div>
            </div>

            <div className="col-auto">
              <div className="d-flex items-center">
                <div className="d-flex items-center flex-wrap x-gap-20">
                  <Links />
                </div>

                {/* <button className="button -md -rounded bg-light-4 text-light-1 ml-30">
                  English
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
