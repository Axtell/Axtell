const header = document.getElementById("header");
const content = header.getElementsByClassName("content")[0];

const responsiveOpen = document.getElementById("r-pop");
const responsiveClose = document.getElementById("r-close");

if (content && responsiveOpen && responsiveClose) {
    responsiveOpen.addEventListener("click", () => {
        content.classList.add("active");
    });

    responsiveClose.addEventListener("click", () => {
        content.classList.remove("active");
    });
}
