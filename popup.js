document.addEventListener("DOMContentLoaded", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        if (validWebsite(activeTab.url)) {
            $('#itemlistButton').on("click", onClick_DownloadItemListJson)
            $('#bonuslistButton').on("click", onClick_DownloadBonusListJson)
            $('#itemImageButton').on("click", onClick_DownloadItemImages)
            $('#bonusImageButton').on("click", onClick_DownloadBonusItemImages)
            $('#allImageButton').on("click", onClick_DownloadAllItemImages)
        } else {
            $('#validWebsite').hide()
            $('#invalidWebsite').show()
        }
    });
})

const validSite = "pso2.jp\/players\/catalog\/(ac|sg|sp)scratch\/([0-9]{8}_[0-9]{2})\/"

function validWebsite(url) {
    var itemRegex = "item"

    return url.match(validSite) != null && url.match(itemRegex) == null
}

function onClick_DownloadItemListJson() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        console.log(tabs[0])
        var itemlistJson = new URL("js/itemlist.json", activeTab.url).href
        chrome.downloads.download({
            url: itemlistJson
        });
    });
}

function onClick_DownloadBonusListJson() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        console.log(tabs[0])
        var itemlistJson = new URL("js/bonuslist.json", activeTab.url).href
        chrome.downloads.download({
            url: itemlistJson
        });
    });
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

function DownloadItemImages(jsonName) {
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
        var jsonUrl = new URL(`js/${jsonName}.json`, activeTab.url).href
        var regexMatch = activeTab.url.match("pso2.jp\/players\/catalog\/(ac|sg|sp)scratch\/([0-9]{8}_[0-9]{2})\/")
        var scratchID = `${regexMatch[1]}_${regexMatch[2]}`
        $.ajax({
            url: jsonUrl,
            type: "GET",
            dataType: "json"
        }).then(data => {
            var imageList = getImageList(activeTab.url, data)
            var zip = JSZip()

            imageList.forEach(image => {
                zip.file(image[0], urlToPromise(image[1]), { binary: true });
            })

            zip.generateAsync({ type: "blob" }).then(function callback(blob) {
                saveAs(blob, `${scratchID}_${jsonName}.zip`);
            });
        })
    })
}