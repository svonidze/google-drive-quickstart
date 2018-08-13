const boundary = '-------314159265358979323846';
const delimiter = "\r\n--" + boundary + "\r\n";
const close_delim = "\r\n--" + boundary + "--";

/**
 * Insert new file.
 *
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Function to call when the request is complete.
 */
function insertFile(fileData, callback) {
    var reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function (e) {
        var contentType = fileData.type;

        var base64Data = btoa(reader.result);
        newFile(fileData.fileName, contentType, base64Data);
    };
}

function newDriveFile(fileName, contentType, base64Data, callback = null) {
    contentType = contentType || 'application/octet-stream';
    var metadata = {
        'title': fileName,
        'mimeType': contentType
    };

    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

    var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': { 'uploadType': 'multipart' },
        'headers': {
            'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody
    });

    request.execute(callback || responseCallback);
}

function updateDriveFile(fileId, contentType, base64Data, callback = null) {
    if(!fileId){
        throw 'Missed fileId';
    }

    contentType = contentType || 'application/octet-stream';

    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        // JSON.stringify({}) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +        
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

    var request = gapi.client.request({
        'path': `/upload/drive/v2/files/${fileId}`,
        'method': 'PUT',
        'params': { 'uploadType': 'multipart', 'alt': 'json' },
        'headers': {
            'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody
    });

    request.execute(callback || responseCallback);
}

function responseCallback(file) {
    if (!file || file.error) {
        alert('File could not be created, see console log');
        console.log(file)
    }
    else {
        alert(`File ${file.title} created. Link ${file.selfLink}.`);
    }
}