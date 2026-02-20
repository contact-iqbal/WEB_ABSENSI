export function aliasesdevision(alias: String) {
    if (alias === "DNA") {
        return "DNA Jaya Group";
    } else if (alias === "RT") {
        return "Rizqi Tour";
    } else {
        return "";
    }
}

export function aliasesstatus(alias: String) {
    if (alias === "pegawai_tetap") {
        return "Permanen";
    } else if (alias === "pegawai_sementara") {
        return "Sementara";
    } else {
        return "";
    }
}
export function aliasesgender(alias: String) {
    if (alias === "laki_laki") {
        return "Laki Laki";
    } else if (alias === "perempuan") {
        return "Perempuan";
    } else {
        return "";
    }
}
export function formatIndoPhone(input: String) {
    if (!input) return "";
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("08")) {
        digits = "62" + digits.slice(1);
    }
    if (!digits.startsWith("62")) {
        return "";
    }

    const local = digits.slice(2);
    const p1 = local.slice(0, 3);
    const p2 = local.slice(3, 7);
    const p3 = local.slice(7, 11);

    if (!p1 || !p2 || !p3) return "";

    return `+62-${p1}-${p2}-${p3}`;
}


