/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder*/


/** --------------------------------------------------------------------------
 * Choose Folder Dialog
 ** --------------------------------------------------------------------------
 * Opens a dialog for the user to choose files
 * @param {string} msg A message to display in the dialog window
 * @return {string} Path to folder
 */
//#region
    function openFolder(msg) {
        var chooseFolder = Folder.selectDialog(msg);
        return chooseFolder;
    }
//#endregion

/** --------------------------------------------------------------------------
 * Choose File Dialog
 ** --------------------------------------------------------------------------
 * Opens a dialog for the user to choose files
 * @param {string} msg A message to display in the dialog window
 * @return {string} Path to folder
 */
//#region
function openFile(msg) {
    var chooseFile = File.openDialog(msg);
    return chooseFile;
}
//#endregion

/** --------------------------------------------------------------------------
 * Open Artwork
 ** --------------------------------------------------------------------------
 * Opens the artwork in the appropriate template file.
 * Relinks the temp link to the PDF file and it's associated barcode
 * @param {string} filePath Path to PDF to be flattened
 * -- // @param {string} barcodePath Path to Barcode EPS to be added [REMOVED 10/20/21 REPLACING ZINT BARCODE FEATURES]
 * @param {string} dirName Path to extension
 * @param {string} inddFile Name of InDesign file to use
 * @param {string} numPages Name of InDesign file to use
 * 
 * 
 */
//#region
    function openArtwork(filePath, barcodePath, dirName, inddFile, numPages) {
        // alert(filePath);
        /** DEBUG ------------------------------------------------------------------------------------------------------------------------------
        // var filePath = "/Users/toddshark/Desktop/Testing Grounds/MENU/11682_45319_4_MENU_print1.pdf";
        // var barcodePath = "/Users/toddshark/Library/Application Support/Adobe/CEP/extensions/com.example.metrixday/zint/1230.eps";
        // var dirName = "/Users/toddshark/Library/Application Support/Adobe/CEP/extensions/com.example.metrixday"
        // var inddFile = "MENU.indt"
        /** -----------------------------------------------------------------------------------------------------------------------------------*/

        // Turn off alerts
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

        // Open appropriate InDesign File
        app.open(dirName + "/indd/" + inddFile);

        // Get doc and links
        var doc = app.activeDocument;

        // Remove page 2 if numPages is 1

        if (numPages == "1") {
            try {
                app.activeDocument.pages[1].remove();
            } catch (e) { }
        }

        var links = doc.links;

        // var barcodeFile = new File(barcodePath); // [REMOVED 10/20/21 REPLACING ZINT BARCODE FEATURES]
        var pdfFile = new File(filePath);

        // Only relink to Preview layer
        // Specific Link DOM path: doc.layers.rectangles.graphics.itemlink

        var relinkRects = doc.layers.itemByName("Preview").rectangles;
        for (x=0; x<relinkRects.length; x++) {
            relinkRects[x].graphics[0].itemLink.relink(pdfFile);
        }


        // Link up new barcode - replace all  [REMOVED 10/20/21 REPLACING ZINT BARCODE FEATURES]
        // for (i=0; i<links.length; i++) {
        //     if (links[i].name.split(".")[1] == "eps") {
        //         links[i].relink(barcodeFile);
        //     }
        // }

        // Fit to window
        app.activeWindow.zoom(ZoomOptions.FIT_PAGE);
        
    }
//#endregion

/** --------------------------------------------------------------------------
 * Change Chosen Menu Template
 ** --------------------------------------------------------------------------
 * Updates the visiblility of the layers to show chosen layer
 * @param {string} templateChoice Menu template choice (name of layer)
 */
//#region
    function changeMenuTemplate(templateChoice) {
        var doc = app.activeDocument;
        var layers = doc.layers;
        for (i=0; i<layers.length; i++) {
            // set everything to invisible
            if (layers[i].name != "Preview") {
                try {
                    layers[i].visible = false;
                } catch(e) {};
                
            }
        }
        
        // Only show Preview and Chosen Layer
        layers.itemByName(templateChoice).visible = true;
    };
//#endregion

/** --------------------------------------------------------------------------
 * Fold Correct
 ** --------------------------------------------------------------------------
 * Similar to Change Chosen Menu, only hiding Preview and showing 2019 (either c or cx)
 * @param {string} fixedLayer Layer of fold correction
 */
//#region
    function foldCorrect(fixedLayer) {
        var menuType = fixedLayer.split("-")[1];
        var prev = "2019-" + menuType;
        var doc = app.activeDocument;
        var layers = doc.layers;
        for (i=0; i<layers.length; i++) {
            // set everything to invisible
            if (layers[i].name != prev) {
                try {
                    layers[i].visible = false;
                } catch(e) {};
            }
        }
        
        // Only show Preview and Chosen Layer
        layers.itemByName(prev).visible = true;
        layers.itemByName(fixedLayer).visible = true;

        
        // Get link from preview
        var prevItemLink = new File(layers.itemByName("Preview").rectangles[0].graphics[0].itemLink.filePath);
        // Set link for fixed layer
        var fixedLayerRects = layers.itemByName(fixedLayer).rectangles;
        for (i=0; i<fixedLayerRects.length;i++) {
            if (fixedLayerRects[i].label != "barcode") {
                fixedLayerRects[i].graphics[0].itemLink.relink(prevItemLink);
            }
        };
        // visiLayer// Specific Link DOM path: doc.layers.rectangles.graphics.itemlink

    };
//#endregion

/** --------------------------------------------------------------------------
 * Hide or Show Mailing Labels
 ** --------------------------------------------------------------------------
 * Shows or Hides all direct mail label corrections
 * @param {string} showHide Are we showing or hiding?
 * @param {string} showHide Which label are we show/hiding?
 */
//#region
function showHideDMLabels(showHide, which) {
    // Unlock all layers
    var doc = app.activeDocument;
    var layers = doc.layers;
    for (i=0; i<layers.length; i++) {
        layers[i].locked = false;
    }

    // Find all groups with label 'barcode-label'
    var docGroups = doc.groups;
    for (i=0; i<docGroups.length; i++) {
        if (docGroups[i].label == which + "-label") {
            // Based on showHide, show or hide the label
            if (showHide == "show") {
                try {
                    docGroups[i].visible = true;
                } catch (e) {};
            } else {
                try {
                    docGroups[i].visible = false;
                } catch (e) {};
            }
        }
    }

    // Relock all layers
    for (i=0; i<layers.length; i++) {
        layers[i].locked = true;
    }
}
//#endregion

/** --------------------------------------------------------------------------
 * Export Active Page to PDF
 ** --------------------------------------------------------------------------
 * Exports the active page to the given pdf path aynchronously
 * Attaches event listener to the document being exported
 * https://forums.adobe.com/thread/945564
 * @param {string} exportPDF File to export to
 * @param {string} dirName Path to extension
 * @param {string} renameTo Type of product being exported
 * @param {string} pdfPreset PDF Preset to use
 * @param {string} numPages Number of PDF pages in this document
 */
// var pdfPath = "/Users/toddshark/Desktop/Testing Grounds/MENU/MENU/11682_45319_4_MENU_print1.pdf"
// exportPDF (pdfPath) 
//#region
    function exportPDF (pdfPath, dirName, renameTo, pdfPreset, numPages) {
        var myDoc = app.activeDocument;

        // Used in for loop below, based on number of pages.
        var toNum = Number(numPages);
        var loopTo = toNum + 1;
        /** --------------------------------------------------------------------------
         * Async Export and afterExport event listener
         ** --------------------------------------------------------------------------
         *  This was more unpredictable than it was useful.
         */
        // Listen(myDoc, pdfPath, dirName); 
        //myDoc.asyncexportFile(ExportFormat.pdfType, File(pdfPath), false, "Mail Shark Print 2019");
        
        /** --------------------------------------------------------------------------
         * Sync Export
         ** --------------------------------------------------------------------------
         *  
         */
        // If the product is 2SBT or MAG, should export to "[High Quality Print]"
        if (renameTo == "2SBT" || renameTo == "MAG" || renameTo == "100#DH" || renameTo.split("_")[0] == "SPL" || renameTo.split("_")[0] == "MPL" || renameTo.split("_")[0] == "LPL" || renameTo == "8_5x11FL") {
            pdfPreset = "[High Quality Print]";
        }

        

        myDoc.exportFile(ExportFormat.pdfType, File(pdfPath), false, pdfPreset);
        
        /** --------------------------------------------------------------------------
         * BridgeTalk tells Photoshop to flatten the document.
         ** --------------------------------------------------------------------------
         *  
         */
        var bt = new BridgeTalk();
        bt.target = "photoshop";
        bt.body = "var pdfPath = new File('" + pdfPath + "')\
        var dirName = '" + dirName + "'\
        var fileName = pdfPath.name;\
        var remExt = fileName.split('.')[0];\
        var folderPath = pdfPath.parent\
        var flattenedFiles = [];\
        for (i=1; i<" + loopTo + "; i++) {\
            var fullPath = new File(folderPath + '/' + remExt + '-' + i + '.pdf')\
            flattenedFiles.push(folderPath + '/' + remExt + '-' + i + '.pdf')\
            // alert(fullPath)\
            // Create a PDF option object\
            var pdfOpenOptions = new PDFOpenOptions;\
            pdfOpenOptions.antiAlias = true;\
            pdfOpenOptions.cropPage = CropToType.MEDIABOX;\
            pdfOpenOptions.bitsPerChannel = BitsPerChannelType.SIXTEEN;\
            pdfOpenOptions.mode = OpenDocumentMode.CMYK;\
            pdfOpenOptions.resolution = 300;\
            pdfOpenOptions.page = i;\
            pdfOpenOptions.usePageNumber = true;\
            // open the file\
            app.open( pdfPath, pdfOpenOptions, false);\
            var doc = app.activeDocument;\
            doc.flatten();\
            pdfSaveOptions = new PDFSaveOptions();\
            pdfSaveOptions.pdfPreset = '[High Quality Print]'\
            doc.saveAs(fullPath, pdfSaveOptions, true, Extension.LOWERCASE)\
            doc.close(SaveOptions.DONOTSAVECHANGES);\
        }\
        pdfPath.remove();\
        var scpt = '" + dirName + "' + '/merge.scpt';\
        try {\
            app.system('osascript \"' + scpt + '\" \"' + flattenedFiles[0].replace(/%20/g, ' ') + '\" \"' + flattenedFiles[1].replace(/%20/g, ' ') + '\"' + ' \"" + pdfPath + "\" \"" + numPages + "\"');\
            var delFlatOne = new File(flattenedFiles[0].replace(/%20/g, ' '));\
            var delFlatTwo = new File(flattenedFiles[1].replace(/%20/g, ' '));\
        } catch(e) {\
            var replaceIn = flattenedFiles[0].replace(/%20/g, ' '); \
            var newName = replaceIn.replace('-1', ''); \
            var delFlatOne = new File(replaceIn);\
            delFlatOne.rename(fileName) \
        }";

        bt.onResult = function (inBT) {
            result = eval(inBT.body);
            var delFile1 = pdfPath.replace(".pdf", "-1.pdf");
            var delFile2 = pdfPath.replace(".pdf", "-2.pdf");
            var delPath1 = new File(delFile1);
            var delPath2 = new File(delFile2);
            try {
                delPath1.remove();
                delPath2.remove();
            } catch(e) {
     
            }

            /* Delete teh files here
            delFlatOne.remove();\
            delFlatTwo.remove();\*/
            
        };

        bt.onError = function (inBT) {
            alert(inBT.body);
        }
        
        bt.send();
        // Close the doc
        myDoc.close(SaveOptions.NO)
    }
//#endregion

/** --------------------------------------------------------------------------
 * Event Listener for Closing Document After PDF Export -- NOT BEING USED!
 ** --------------------------------------------------------------------------
 * Closes the document once the async exportFile from exportPDF() has completed
 * https://forums.adobe.com/thread/945564
 * 
 * @param {object} myDoc The document to watch for export to finish
 * @param {string} pdfPath The file path to the PDF that was exported
 * @param {string} dirName Path to extension
 */
//#region
    function Listen (myDoc, pdfPath, dirName) {
        app.addEventListener("afterExport", function(evt) {
            var task = app.idleTasks.add ({name:"exportPDF", sleep: 1000});
            var listener  = task.addEventListener (IdleEvent.ON_IDLE, function(e) {
                    listener.remove();
                    task.remove();
                    if (/Adobe\sPDF/.test(evt.format)) {
                        // Tell Photoshop to flatten the PDF
                        // app.doScript(psJSX, ScriptLanguage.JAVASCRIPT, [pdfPath]);
                        // with #target photoshop is another way to do this
                        // BridgeTalk was easier to handle the arguments
                        // https://forums.adobe.com/thread/1870071
                        // var bt = new BridgeTalk();
                        // bt.target = "photoshop";
                        // bt.body = "var pdfPath = new File('" + pdfPath + "')\
                        // var dirName = '" + dirName + "'\
                        // var fileName = pdfPath.name;\
                        // var remExt = fileName.split('.')[0];\
                        // var folderPath = pdfPath.parent\
                        // var flattenedFiles = [];\
                        // for (i=1; i<3; i++) {\
                        //     var fullPath = new File(folderPath + '/' + remExt + '-' + i + '.pdf')\
                        //     flattenedFiles.push(folderPath + '/' + remExt + '-' + i + '.pdf')\
                        //     // alert(fullPath)\
                        //     // Create a PDF option object\
                        //     var pdfOpenOptions = new PDFOpenOptions;\
                        //     pdfOpenOptions.antiAlias = true;\
                        //     pdfOpenOptions.cropPage = CropToType.MEDIABOX;\
                        //     pdfOpenOptions.bitsPerChannel = BitsPerChannelType.SIXTEEN;\
                        //     pdfOpenOptions.mode = OpenDocumentMode.CMYK;\
                        //     pdfOpenOptions.resolution = 300;\
                        //     pdfOpenOptions.page = i;\
                        //     pdfOpenOptions.usePageNumber = true;\
                        //     // open the file\
                        //     app.open( pdfPath, pdfOpenOptions, false);\
                        //     var doc = app.activeDocument;\
                        //     doc.flatten();\
                        //     pdfSaveOptions = new PDFSaveOptions();\
                        //     pdfSaveOptions.pdfPreset = '[High Quality Print]'\
                        //     doc.saveAs(fullPath, pdfSaveOptions, true, Extension.LOWERCASE)\
                        //     doc.close(SaveOptions.DONOTSAVECHANGES);\
                        // }\
                        // pdfPath.remove();\
                        // var scpt = '" + dirName + "' + '/merge.scpt';\
                        // app.system('osascript \"' + scpt + '\" \"' + flattenedFiles[0].replace(/%20/g, ' ') + '\" \"' + flattenedFiles[1].replace(/%20/g, ' ') + '\"' + ' \"" + pdfPath + "\"');\
                        // var delFlatOne = new File(flattenedFiles[0].replace(/%20/g, ' '));\
                        // var delFlatTwo = new File(flattenedFiles[1].replace(/%20/g, ' '));\
                        // delFlatOne.remove();\
                        // delFlatTwo.remove();";
                        // bt.onResult = function (inBT) {
                        //     result = eval(inBT.body);
                        // };
        
                        // bt.onError = function (inBT) {
                        //     alert(inBT.body);
                        // }
                        // bt.send();
                        // // Close the doc
                        // myDoc.close(SaveOptions.NO)
                    };
                });
            }).name = "exportPDF";
    }
//#endregion

/** --------------------------------------------------------------------------
 * Create Dumb Document
 ** --------------------------------------------------------------------------
 * Creates a stupid document so that InDesign doesn't
 * default to the home screen when the last open document is closed
 */
//#region
    function dumbDoc() {
        app.documents.add({
            width:"8.5in",
            height:"11in"
        })


        var newColor = color_add(app.activeDocument, "Background", ColorModel.PROCESS, [62, 54, 53, 25]);

        var bgRect = app.activeDocument.rectangles.add({
            geometricBounds: app.activeDocument.pages[0].bounds,
            fillColor: newColor
        });


        var txtFrame = app.activeDocument.textFrames.add({
            geometricBounds:["1.88in","1.57in","9.12in","6.93in"],
            contents:"I'm the Metrix Day dumb document. I'm only here to prevent InDesign from defaulting to the home screen when the last document is closed."
        });

        txtFrame.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;
        txtFrame.paragraphs[0].appliedFont = "Tahoma";
        txtFrame.paragraphs[0].fillColor = "Paper";
        txtFrame.paragraphs[0].pointSize = 38;
        txtFrame.paragraphs[0].justification = Justification.CENTER_ALIGN;
        txtFrame.paragraphs[0].hyphenation = false;

        txtFrame.createOutlines();

        // What is the current GPU status?
        var currentGPU = app.gpuPerformancePreferences.enableGpuPerformance;
        return currentGPU;

    }
//#endregion



/** --------------------------------------------------------------------------
 * Add a Scratch-Off Box
 ** --------------------------------------------------------------------------
 * Adds a scratch-off box to the current document
 * 
 * @param {string} onOffBool "true" if making scratch-off, "false" if removing it
 * @param {string} myID The ID of the checkbox, so-pc or so-jumbo
 */
//#region
    function addScratchOff(onOffBool, myID) {
        if (onOffBool == "true") { // Make the scratch off box

            // Create a guides layer, if one does not yet exist
            var guideLayer = app.activeDocument.layers.itemByName("Guides");

            if (!guideLayer.isValid) {
                var guideLayer = app.activeDocument.layers.add({
                    name:"Guides",
                    layerColor: UIColors.GREEN
                });
            }

            // Different geoBounds if pc vs jumbo
            if (myID == "so-pc") {
                var soBounds = ["2.51333843294165in","3.12597222222227in","3.26333843294165in","4.87597222222227in"];
                var sogBounds = ["1.75in","1.5in","3.98778797699442in","9in"];
            } else if (myID == "jumbo-pc") {
                var soBounds = ["5.52533843294165in","3.12597222222227in","6.27533843294165in","4.87597222222227in"];
                var sogBounds = ["4.762in","1.50000000000009in","6.99978797699442in","6.50194444444445in"];
            } else if (myID == "peel-pc") {
                var soBounds = ["1.96938440920439","2","4.46938440920439","4.5"];
                var sogBounds = ["1.75","1.50000000000009","4.47","6.375"];
            }



            var guideBox = app.activeDocument.pages[1].rectangles.add(guideLayer, {
                geometricBounds: sogBounds,
                fillColor:"C=0 M=0 Y=100 K=0",
                strokeWeight:"0px",
                nonprinting:true,
                name:"so-box-guide"
            });

            guideBox.transparencySettings.blendingSettings.opacity = 39;
            guideBox.locked = true;

            app.activeDocument.pages[1].rectangles.add(guideLayer, {
                geometricBounds: soBounds,
                fillColor:"Paper",
                strokeWeight:"0px",
                // nonprinting:true,
                name:"so-box"
            });
        } else { // Remove the scratch off box
            app.activeDocument.rectangles.itemByName("so-box-guide").locked = false;
            app.activeDocument.rectangles.itemByName("so-box-guide").remove();
            app.activeDocument.rectangles.itemByName("so-box").remove();
        }
        

        

    }
 //#endregion
 

 /** --------------------------------------------------------------------------
 * Flip Pages
 ** --------------------------------------------------------------------------
 * Makes page 2 page 1, and page 1 page 2
 * 
 */
//#region
    function flipPages() {

    // Rewritten Jan 14 2021
    // Looks at placed PDF page, if page 2, place page 1, otherwise place page 2
    
    try {
        var rects = app.activeDocument.rectangles;
        for (var n = 0; n < rects.length; n++) {
            var myPDFs = rects[n].pdfs;
            if (myPDFs.length > 0) {
                //linkType = "Adobe Portable Document Format (PDF)"
                var pdfPath = myPDFs[0].itemLink.filePath;
                var pdfPage = myPDFs[0].pdfAttributes.pageNumber;
    
                if (pdfPage == 2) {
                    app.pdfPlacePreferences.pageNumber = 1;
                    try {
                        $.writeln(pdfPath)
                        rects[n].place(File(pdfPath), false);
                    } catch (e){
                        alert(e);
                    }
    
                } else {
                    app.pdfPlacePreferences.pageNumber = 2;
                    rects[n].place(File(pdfPath), false);
                }
    
                $.writeln(pdfPath);
                $.writeln(pdfPage);
            }
        }
    } catch (e) {
        alert(e);
    }
        /*
        // OLD VERSION
        app.activeDocument.pages[1].move(LocationOptions.AT_BEGINNING);

        // Unlock all
        for (i=0; i<app.activeDocument.layers.length; i++) {
            app.activeDocument.layers[i].locked = false;
        }

        // Rewriting the barcode handling
        var moveLabels = ["barcode-label", "dm-label", "yr", "yrBack"]
        for (var i = 0; i < app.activeDocument.groups.length; i++ ) {
            var groupName = app.activeDocument.groups[i].name;
            $.writeln(groupName)
            if (moveLabels.contains(groupName)) {
                var myGroup = app.activeDocument.groups[i];
                xpos =  myGroup.geometricBounds[1];
                ypos =  myGroup.geometricBounds[0];
                // $.writeln("x: " + xpos + " y: " + ypos)
                myGroup.move(app.activeDocument.pages[1]);
                myGroup.move([xpos, ypos]);
            }
        }
        */
    }

//#endregion


 /** --------------------------------------------------------------------------
 * Update Barcode
 ** --------------------------------------------------------------------------
 * Updates the current barcode with a new barcode
 * @param {string} barcodePath Path to the new barcode
 */
//#region
    function updateBarcode(barcodePath) {

        var barcodeFile = new File(barcodePath);

        // Get doc and links
        var doc = app.activeDocument;
        var links = doc.links;

        // Link up new barcode - replace all
        for (i=0; i<links.length; i++) {
            if (links[i].name.split(".")[1] == "eps") {
                links[i].relink(barcodeFile);
            }
        }
    }
//#endregion

/** --------------------------------------------------------------------------
 * Reset Active Document
 ** --------------------------------------------------------------------------
 * close active document without saving, args to openArtwork()
 * @param {string} filePath Path to PDF to be flattened
 * @param {string} barcodePath Path to Barcode EPS to be added
 * @param {string} dirName Path to extension
 * @param {string} inddFile Name of InDesign file to use
 */
//#region
    function resetDoc(filePath, barcodePath, dirName, inddFile) {
        //fullPath, barcodePath, __dirname, inddFile
        app.activeDocument.close(SaveOptions.NO)
        openArtwork(filePath, barcodePath, dirName, inddFile);
                
    }
//#endregion


 /** --------------------------------------------------------------------------
 * Rotate InDesign Page
 ** --------------------------------------------------------------------------
 * Rotates the link on the given page
 * @param {string} pageNum Number of page to rotate
 * @param {string} linkDir Direction to rotate the page
 */
//#region
    function rotPage(docPage, direction) {

        var pageNum = docPage[docPage.length -1];
        var groupName = "rotGroup" + pageNum;

        // Resize Page ---------------------------------------------------------------------------------
        app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.inches;  
        app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.inches;

        if (docPage == "page1") {
            var myPage = app.activeDocument.pages[0];
        } else {
            var myPage = app.activeDocument.pages[1];
        };

        if (direction == "clock") {
            var myTrans = app.transformationMatrices.add({counterclockwiseRotationAngle:-90});
        } else {
            var myTrans = app.transformationMatrices.add({counterclockwiseRotationAngle:90});
        }

        // Manually set the width to the height, and the height to the width
        var myHeight = myPage.bounds[2];
        var myWidth = myPage.bounds[3];
        

        // Rotate Page Items ---------------------------------------------------------------------------------
        
        // Unlock all layers
        for (i=0; i<app.activeDocument.layers.length; i++) {
            app.activeDocument.layers[i].locked = false;
        }
        var pItems = myPage.parent.pageItems;
        var vItems = new Array;
        for (i=0; i<pItems.length; i++) {
            pItems[i].locked = false;
            if (pItems[i].itemLayer.visible != false) {
                $.writeln("Found visible item")
                vItems.push(pItems[i]);
            }
        }
        

        // Create group out of vItems, or select it if already exists
        if (vItems.length == 1) {
            var newGroup = vItems[0];
        } else {
            try {
                var newGroup = app.activeDocument.groups.add(vItems);
                newGroup.name = groupName
            } catch (e) {
                $.writeln(e)
                    var newGroup = app.activeDocument.groups.itemByName(groupName);
            }
        }
        
        // app.select(NothingEnum.NOTHING);
        // app.select (newGroup, SelectionOptions.ADD_TO);
        newGroup.transform(CoordinateSpaces.INNER_COORDINATES, AnchorPoint.CENTER_ANCHOR, myTrans)
        try {
            newGroup.ungroup();
        } catch (e) {
            // probably wasn't a group
        }
        
        // Lock all layers
        for (i=0; i<app.activeDocument.layers.length; i++) {
            app.activeDocument.layers[i].locked = true;
        }
        myPage.resize(CoordinateSpaces.INNER_COORDINATES, AnchorPoint.CENTER_ANCHOR, ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH, [72 * myHeight, 72 * myWidth]);


    }
//#endregion

 /** --------------------------------------------------------------------------
 * Add a color to the current document
 ** --------------------------------------------------------------------------
 * Adds a given color to the current document
 * https://github.com/fabianmoronzirfas/extendscript/wiki/Colors-And-Swatches
 * @param {object} myDocument Document to add it to
 * @param {string} myColorName Name for the color
 * @param {object} myColorModel Model for the color
 * @param {array} myColorModel Color value for the color
 */
//#region
    function color_add(myDocument, myColorName, myColorModel, myColorValue){
        if(myColorValue instanceof Array == false){
            myColorValue = [(parseInt(myColorValue, 16) >> 16 ) & 0xff, (parseInt(myColorValue, 16) >> 8 ) & 0xff,    parseInt(myColorValue, 16 ) & 0xff ];
            myColorSpace = ColorSpace.RGB;
        }else{
            if(myColorValue.length == 3)
            myColorSpace = ColorSpace.RGB;
            else
            myColorSpace = ColorSpace.CMYK;
        }
        try{
            myColor = myDocument.colors.item(myColorName);
            myName = myColor.name;
        }
        catch (myError){
            myColor = myDocument.colors.add();
            myColor.properties = {name:myColorName, model:myColorModel, space:myColorSpace ,colorValue:myColorValue};
        }
        return myColor;
    }
//#endregion
/** --------------------------------------------------------------------------
 * Close current document
 ** --------------------------------------------------------------------------
 * Closes current document
 */
//#region
    function closeDoc() {
        app.activeDocument.close(SaveOptions.NO)
    }
//#endregion
 
/** --------------------------------------------------------------------------
 * Return all of the PDF exports
 ** --------------------------------------------------------------------------
 * Gets all of the available PDF exports, and returns choice to gui
 * https://indisnip.wordpress.com/2010/08/02/simple-pdf-export-with-preset-selection/
 */
//#region
    function getExports() {
        var myPresets = app.pdfExportPresets.everyItem().name;
        myPresets.unshift("- Select Preset -");

        var myWin = new Window('dialog', 'PDF Export Presets');
        myWin.orientation = 'row';
        with(myWin){
            myWin.sText = add('statictext', undefined, 'Select PDF Export preset:');
            myWin.myPDFExport = add('dropdownlist',undefined,undefined,{items:myPresets});
            myWin.myPDFExport.selection = 0;
            myWin.btnOK = add('button', undefined, 'OK');
        };
        myWin.center();
        var myWindow = myWin.show();

        if(myWindow == true && myWin.myPDFExport.selection.index != 0){
            var myPreset = app.pdfExportPresets.item(String(myWin.myPDFExport.selection));
            return myPreset.name;
        } else{
            alert("No PDF Preset selected!");
        }
    }
//#endregion

/** --------------------------------------------------------------------------
 * Show and update the Year Override
 ** --------------------------------------------------------------------------
 * Replaces the year in the template with the override
 */
function showYear(year) {
    var myDoc = app.activeDocument;
    // Try to make the year text frames visible
    // This is done for products with alternative mailing label areas.
    var yrFrames = myDoc.textFrames;
    $.writeln(yrFrames.length);
    for (var i = 0; i < yrFrames.length; i++) {
        if (yrFrames[i].name == "yr") {
            // Try to make visible and change contents
            try {
                yrFrames[i].visible = true;
                yrFrames[i].contents = '©' + year;
            } catch (e) {
                $.writeln("'yr' frame might be invisible")
            }
        } else if (yrFrames[i].name == "yrBack") {
            try {
                yrFrames[i].visible = true;
            } catch (e) {
                $.writeln("'yrBack' frame might be invisible")
            }
        }
    }
}

/** --------------------------------------------------------------------------
 * Hide the Year Override
 ** --------------------------------------------------------------------------
 * Hides the year override
 */
function hideYear() {
    var myDoc = app.activeDocument;
    // Try to make the year text frames visible
    // This is done for products with alternative mailing label areas.
    var yrFrames = myDoc.textFrames;
    $.writeln(yrFrames.length);
    for (var i = 0; i < yrFrames.length; i++) {
        if (yrFrames[i].name == "yr") {
            // Try to make visible and change contents
            try {
                yrFrames[i].visible = false;
            } catch (e) {
                $.writeln("'yr' frame might be invisible")
            }
        } else if (yrFrames[i].name == "yrBack") {
            try {
                yrFrames[i].visible = false;
            } catch (e) {
                $.writeln("'yrBack' frame might be invisible")
            }
        }
    }
}

/** --------------------------------------------------------------------------
 * Place Client Code
 ** --------------------------------------------------------------------------
 * Places a client code in the center of the page
 */
//#region
function addCode() {

    var clientCode = myInput();
    function myInput() {
        var myWindow = new Window("dialog", "Form");
        var myInputGroup = myWindow.add("group");
         myInputGroup.add("statictext", undefined, "Client Code:");
         var myText = myInputGroup.add("edittext", undefined, "00000");
         myText.characters = 20;
         myText.active = true;
        var myButtonGroup = myWindow.add("group");
         myButtonGroup.alignment = "right";
         myButtonGroup.add("button", undefined, "OK");
         myButtonGroup.add("button", undefined, "Cancel");
         if (myWindow.show () == 1) {
            return myText.text;
        }
        exit ();
    }


    var myPage = app.activeWindow.activePage; // Active page

    // Add background cover for client code
    var codeBg = myPage.rectangles.add({
        geometricBounds:[0,0,0.11,0.51],
        fillColor:"Paper",
        // strokeWeight:0
        strokeColor:"None"
    });

    var code = myPage.textFrames.add({
        geometricBounds:[0,.03,0.11,0.51],
        contents:clientCode
    });

    code.paragraphs[0].properties = {
        appliedFont:app.fonts.item("Arial"),
        fontStyle:"Bold",
        pointSize:8,
        justification:Justification.LEFT_ALIGN
    };

    code.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;

    var codeGroup = [codeBg, code];
    var theGroup = myPage.groups.add(codeGroup);

    // Center the group
    var pb = myPage.bounds;
    var mult = Math.pow(10, 3);

    var width = Math.round((pb[3] - pb[1])* mult ) / mult;
    var height = Math.round((pb[2] - pb[0])* mult ) / mult;

    theGroup.move([(width / 2), (height / 2)]);

    /*
    12345_57046_1_MENU_print1.pdf
    12345_57046_1_MENU_print2.pdf
    */

}
//#endregion

/**
 * 10/20/2021 - GPU TOGGLE
 * @param {String} to True or false as a string, enable or disable
 */
function toggleGPU (to) {
    if (to == "true") {
        app.gpuPerformancePreferences.enableGpuPerformance = true;
    } else if (to == "false") {
        app.gpuPerformancePreferences.enableGpuPerformance = false;
    }
}

 /** --------------------------------------------------------------------------
 * Trash Bin
 ** --------------------------------------------------------------------------*/

    // function rotateLinks(docPage, linkDir) {

    //     if (docPage == "page1") {
    //         var myPage = app.activeDocument.pages[0];
    //     } else {
    //         var myPage = app.activeDocument.pages[1];
    //     };
        
    //     // Set direction
    //     if (linkDir == "clock") {
    //         var myRotation = app.transformationMatrices.add({counterclockwiseRotationAngle: -90});  
    //     } else {
    //         var myRotation = app.transformationMatrices.add({counterclockwiseRotationAngle: 90});
    //     }

    //     var rects = myPage.rectangles;

    //     for (i=0; i<rects.length; i++) {
    //         rects[i].graphics[0].transform(CoordinateSpaces.pasteboardCoordinates, AnchorPoint.centerAnchor, myRotation);
    //         rects[i].fit (FitOptions.FILL_PROPORTIONALLY);
    //     }

    // }