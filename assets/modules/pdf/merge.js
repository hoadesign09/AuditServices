var files = [];
var deleteIndex = null;
var deleteCard = null;

$("#fileInput").on("change", async function () {
    files = [];
    const cards = $();
    var pageNum = 0;
    $("#list").empty();
    $("#loading").removeClass("hidden");
    for (const file of this.files) {
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: .35 });
        const c = document.createElement("canvas");
        c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
        const idx = files.push({ file }) - 1;
        const card = $(`<div class="card-2"><div class="thumb"></div><b>${file.name}</b><br><span>${pdf.numPages} pages</span><br><span class="remove-btn">Remove</span></div>`);
        card.find(".thumb").append(c);
        card.find(".remove-btn").click(function () {
            deleteIndex = idx;
            deleteCard = card;
            const modal = new bootstrap.Modal(
                document.getElementById("deleteModal")
            );
            modal.show();
        });
        cards.push(card[0]);
        pageNum += pdf.numPages;
    }
    $("#loading").addClass("hidden");
    $("#list").append(cards);
    const filesCount = $(`<span class="files-count">Files selected: ${files.length}</span><span class="files-count"> • </span><span class="files-count">Total pages: ${pageNum}</span>`);
    $("#fileCount").prepend(filesCount);
    $("#btnMerge").attr("disabled", false);
    $("#btnMerge").removeAttr("title");
    $("#btnClearFiles").attr("disabled", false);
    $("#btnClearFiles").removeAttr("title");
});

$("#btnMerge").click(async () => {
    const out = await PDFLib.PDFDocument.create();
    for (const it of files) {
        if (!it) continue;
        const b = await it.file.arrayBuffer();
        const p = await PDFLib.PDFDocument.load(b);
        const cps = await out.copyPages(p, p.getPageIndices());
        cps.forEach(pg => out.addPage(pg));
    }
    const bytes = await out.save();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    a.download = "Merged.pdf"; a.click();
});

$("#btnConfirmDelete").click(function () {

    if (deleteIndex != null) {
        files[deleteIndex] = null;
        deleteCard.remove();
    }
    bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
    deleteIndex = null;
    deleteCard = null;
});