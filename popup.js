const validSite = "pso2.(jp|com)\/players\/catalog\/(ac|sg|sp)scratch\/([0-9]{8}_[0-9]{2})\/"
var region = null
var scratchData = {
    name: null,
    id: null,
    type: null
}

document.addEventListener("DOMContentLoaded", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        if (GetScratchID(activeTab.url)) {
            $('#itemlistButton').on("click", onClick_DownloadItemListJson)
            $('#bonuslistButton').on("click", onClick_DownloadBonusListJson)
            $('#itemImageButton').on("click", onClick_DownloadItemImages)
            $('#bonusImageButton').on("click", onClick_DownloadBonusItemImages)
            $('#allImageButton').on("click", onClick_DownloadAllItemImages)
            $('#itemNamelistButton').on("click", onClick_DownloadItemName)
            $('#bonusNamelistButton').on("click", onClick_DownloadBonusName)
            $(`#${scratchData.type}Scratch`).show()
        } else {
            $('#validWebsite').hide()
            $('#invalidWebsite').show()
        }
    });
})

function GetScratchID(url) {
    var itemRegex = "item"
    var regexMatch = url.match(validSite)

    if (regexMatch == null && url.match(itemRegex) == null)
        return false

    region = regexMatch[1]
    scratchData.type = regexMatch[2]
    scratchData.id = regexMatch[3]

    return true
}

function DownloadJSON(ListType) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        let activeTab = tabs[0];
        var jsonUrl = new URL(`js/${ListType}.json`, activeTab.url).href
        $.ajax({
            url: jsonUrl,
            type: "GET",
            dataType: "json"
        }).then(data => {
            let scratchName = region == "jp" ? data[0].scratchname : data[0].scratchname_en
            let blob = new Blob([JSON.stringify(data, null, "\t")], { type: "text/plain;charset=utf-8" })
            saveAs(blob, `${scratchData.type}${scratchData.id}_${ListType}_${scratchName}.json`);
        })
    });
}

function onClick_DownloadItemListJson() {
    DownloadJSON("itemlist")
}

function onClick_DownloadBonusListJson() {
    DownloadJSON("bonuslist")
}

function onClick_DownloadItemImages() {
    DownloadItemImages("itemlist")
}

function onClick_DownloadBonusItemImages() {
    DownloadItemImages("bonuslist")
}

function onClick_DownloadAllItemImages() {
    DownloadItemImages("itemlist")
    DownloadItemImages("bonuslist")
}

function DownloadItemImages(ListType) {
    function urlToPromise(url) {
        return new Promise(function(resolve, reject) {
            JSZipUtils.getBinaryContent(url, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    function getImageList(url, data) {
        var imagesList = []
        for (var index = 0; index < data.length; index++) {
            const illust = data[index].illust.split(","),
                screenshot = data[index].ss.split(",")

            if (data[index].ss.length > 1)
                for (let l = 0; l < screenshot.length; l++) {
                    imagesList.push([`${screenshot[l]}.jpg`, new URL(`../../img/item/ss/${screenshot[l]}.jpg`, url).href])
                }
            else if (illust.length > 1) {
                for (let l = 0; l < illust.length; l++) {
                    let n = "";
                    if (illust[l].match("il")) {
                        imagesList.push([`${illust[l].replace("il", "")}.png`, new URL(`../../img/item/illust/${illust[l].replace("il", "")}.png`, url).href])
                    } else {
                        imagesList.push([`${illust[l]}.png`, new URL(`img/ss/${illust[l]}.png`, url).href])
                    }
                }
            } else if (illust[0].match("icon")) {
                continue;
            } else {
                imagesList.push([`${illust[0]}.png`, new URL(`img/ss/${illust[0]}.png`, url).href])
            }
        }

        return imagesList
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        var jsonUrl = new URL(`js/${ListType}.json`, activeTab.url).href
        $.ajax({
            url: jsonUrl,
            type: "GET",
            dataType: "json"
        }).then(data => {
            let imageList = getImageList(activeTab.url, data)
            let zip = JSZip()
            let scratchName = region == "jp" ? data[0].scratchname : data[0].scratchname_en

            imageList.forEach(image => {
                zip.file(image[0], urlToPromise(image[1]), { binary: true });
            })

            zip.generateAsync({ type: "blob" }).then(function callback(blob) {
                saveAs(blob, `${scratchData.type}${scratchData.id}_${ListType}_${scratchName}.zip`)
            });
        })
    })
}

function onClick_DownloadItemName() {
    jsonToNameList("itemlist")
}

function onClick_DownloadBonusName() {
    jsonToNameList("bonuslist")
}

function jsonToNameList(ListType) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        var jsonUrl = new URL(`js/${ListType}.json`, activeTab.url).href
        $.ajax({
            url: jsonUrl,
            type: "GET",
            dataType: "json"
        }).then(data => {
            let list = []
            data.forEach(elem => {
                list.push(region == "jp" ? elem.name : elem.name_en)
            })
            let scratchName = region == "jp" ? data[0].scratchname : data[0].scratchname_en
            let blob = new Blob([list.join("\n")], { type: "text/plain;charset=utf-8" })
            saveAs(blob, `${scratchData.type}${scratchData.id}_${ListType}_${scratchName}_namelist.txt`);
        })
    })
}