import React from "react";

function About() {
  return (
    <>
      <section class="text-gray-700 body-font">
        <div class="container mx-auto flex px-5 py-20 items-center justify-center flex-col">
          {/* <img
            class="lg:w-1/6 md:w-2/6 w-3/6 mb-10 object-cover object-center rounded-lg"
            alt="hero"
            src={Profile}
          /> */}
          <div class="text-center lg:w-2/3 w-full">
            {/* <h1 class="title-font sm:text-4xl md:text-3xl text-2xl mb-4 font-medium text-gray-900">
              Based on the open-source project {process.env.REACT_APP_VERSION}
            </h1> */}
            <p class="mt-1 leading-relaxed">
              <a
                className="text-blue-500"
                href="https://github.com/KaraRyougi/frontend"
              >
                Project Repository
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
