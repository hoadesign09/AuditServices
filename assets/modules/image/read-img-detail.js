$("#fileInput").on("change", async function () {

    const file = this.files[0];
    if (!file) return;

    $("#loading").removeClass("hidden");
    $("#dvDetails").html("Reading image metadata...");

    let imageUrl = "";

    try {

        imageUrl = URL.createObjectURL(file);
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
        });

        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const buffer = await file.arrayBuffer();
        const metadata = ExifReader.load(buffer, {
            expanded: true
        });

        // console.log(metadata);

        let html = "";

        html += `
            <div class="text-center mb-4">

                <img
                    src="${imageUrl}"
                    class="img-fluid img-thumbnail"
                    style="max-width:500px;max-height:500px;"
                >

                <div class="text-white mt-2">
                    <strong>${width} × ${height} px</strong>
                </div>

            </div>
        `;

        html += `
            <h3 class="txt-heading">File Information</h3>

            <table class="table table-bordered">

                <tr>
                    <th width="250">Property</th>
                    <th>Value</th>
                </tr>

                <tr>
                    <td>Name</td>
                    <td>${file.name}</td>
                </tr>

                <tr>
                    <td>Size</td>
                    <td>${file.size.toLocaleString()} bytes</td>
                </tr>

                <tr>
                    <td>Type</td>
                    <td>${file.type}</td>
                </tr>

                <tr>
                    <td>Last Modified</td>
                    <td>${new Date(file.lastModified)}</td>
                </tr>

                <tr>
                    <td>Width</td>
                    <td>${width}px</td>
                </tr>

                <tr>
                    <td>Height</td>
                    <td>${height}px</td>
                </tr>

            </table>
        `;

        function renderObject(obj, level) {

            if (!obj)
                return "";

            let html = "";

            $.each(obj, function (key, value) {

                if (typeof value === "object" && value !== null && !Array.isArray(value)) {

                    html += `
                        <tr class="table-primary">
                            <td colspan="2">
                                <b>${"&nbsp;".repeat(level * 4)}${key}</b>
                            </td>
                        </tr>
                    `;

                    html += renderObject(value, level + 1);

                }
                else {

                    html += `
                        <tr>
                            <td>${"&nbsp;".repeat(level * 4)}${key}</td>
                            <td>${String(value)}</td>
                        </tr>
                    `;

                }

            });

            return html;

        }

        html += `
            <h3 class="txt-heading">All Metadata</h3>

            <table class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th width="350">Property</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${renderObject(metadata, 0)}
                </tbody>
            </table>
        `;

        $("#dvDetails").html(html);

    }
    catch (e) {

        console.error(e);
        $("#dvDetails").html(`
            <div class="alert alert-danger">
                Cannot read metadata.
            </div>
        `);

    }
    finally {

        if (imageUrl) {
            setTimeout(() => {
                URL.revokeObjectURL(imageUrl);
            }, 1000);
        }

        $("#loading").addClass("hidden");

    }

});