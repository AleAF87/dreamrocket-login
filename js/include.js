async function includeHTML() {
    const includes = document.querySelectorAll("[data-include]");

    for (const el of includes) {
        const file = el.getAttribute("data-include");
        const res = await fetch(file);

        if (res.ok) {
            el.innerHTML = await res.text();
        } else {
            el.innerHTML = "<p>Erro ao carregar componente.</p>";
        }
    }
}

document.addEventListener("DOMContentLoaded", includeHTML);
