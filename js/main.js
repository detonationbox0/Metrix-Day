/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ** Metrix Day
 ** by Todd in August / September 2019
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Fold everything! VSCode: Cmd + K, 8
 ** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

 /** -----------------------------------------------------------------------------------
 ** Globals
 ** ------------------------------------------------------------------------------------
 * These are referenced in the export button
 * Declaring them here keeps em global for whatever is open
 */
//#region
    var renameTo = "";
    var prodType = "";
    var folderDir = "";
    var templateChoice = "2019-c"
    var clientCode = "";
    var clientCodes = [];
    var fileName = "";
    var fileID = "";
    var inddFile = "";
    var fullPath = "";
    var barcodePath = "";
    var boolColor = false;
    var numPages = "";
    //#endregion
// displayMsg("Warning! This is a warning.", "warning");
/** -----------------------------------------------------------------------------------
 ** Node Modules
 ** ----------------------------------------------------------------------------------*/
//#region

    var Tabulator = require('tabulator-tables'); // http://tabulator.info/

    // Files
    var fs = require('fs-extra');

    // Zint
    const { exec } = require('child_process');

    // const {dialog} = require('electron').remote;

    // var download = require('download-file')

    const csv = require('csvtojson')
    var globPreset = ""
    // Setting global for PDF preset here since it requires fs
    fs.readFile(__dirname + "/pdfPreset.txt", 'utf8', function(err, data) {
        if (err) console.log(err);
        globPreset = String(data);
    });

    var path = require('path');
const { on } = require('events');
    // Sejda SDK - This will come in handy in lots of projects!
    // http://sejda.org/
    const sejda = "\"" + __dirname + "/sejda/bin/sejda-console" + "\""
    // var PHE = require("print-html-element");
    // var xlsx = require('xlsx');
//#endregion

/** -----------------------------------------------------------------------------------
** Load the PDF Export Settings
** -----------------------------------------------------------------------------------
* Populates the PDF export selection with available exports
*/


/** -----------------------------------------------------------------------------------
** Build the table
** -----------------------------------------------------------------------------------
* A blank table for now.
* When a folder is chosen, populates with files
*/
//#region

    const table = new Tabulator("#file-table", {
        placeholder:"Drop Metrix Day Files Here",
        movableRows: true,
        groupStartOpen:false,
        groupToggleElement:"header",
        index:"id",
        // layout: "fitDataFill",
        // height:"calc(100vh - 80px)",
        groupBy:"prod",
        columns:[
            {title:"id", field:"id", headerFilter:"input", visible:false},
            {formatter:"buttonCross", width:40, align:"center", cellClick:function(e, cell){
                cell.getRow().delete();
            }},
            {title:"Flatten", width:90, formatter:function(cell, formatterParams) {
                // Add a button, with a class to trigger onclick, and value to indicate file details
                return "<button class='open-button' value='" + cell._cell.row.data.file + ";" + cell._cell.row.data.folder + ";" + cell._cell.row.data.prod + ";" + cell._cell.row.data.id + "'>Open</button>"
            }},
            {title:"Files", width:179, field:"file", headerFilter:"input"},
            {title:"Product", field:"prod", headerFilter:"input"},
            {title:"Rename", field:"renameto", editor:"input", headerFilter:"input"},
            {title:"Follow-Up", width:300, field:"follow", align:"left", headerFilter:"input", editor:"input"},
            {title:"Folder", field:"folder", headerFilter:"input", visible:false}
        ],
        groupHeader:function(value, count, data, group) {
            return value + `<button id="del-group" onclick="delGroup('` + group._group.key + `')">Remove</button`;
        
        },
        groupVisibilityChanged:function(group, visible){
            // Rows dissapear when this doesn't happen
            table.redraw();
        },
        rowMoved:function(row) {
            var newProd = row._row.data.prod; // PC
            var myID = row._row.data.id;
            var fileName = row._row.data.file; // 1902_47378_3_PC_print1.pdf
            var filePath = row._row.data.folder + "/" + fileName; // /Users/toddshark/Desktop/Testing Grounds/DownloadAll_IanReed_540_artfiles/1902_47378_3_PC_print1.pdf
            var nameComponents = fileName.split("_");
            var newFileName = nameComponents[0] + "_" + nameComponents[1] + "_" + nameComponents[2] + "_" + newProd + "_" + nameComponents[nameComponents.length - 1];
            var newFilePath = row._row.data.folder + "/" + newFileName
            // Update tabulator
            table.updateData([{id: myID, file: newFileName}]);

            // Rename file
            fs.rename(filePath, newFilePath, function (err) {
                if (err) console.log(err);
            });

        }, dataEdited:function(data){
            try {
                highlightDuplicates (data);
            } catch (e) {
                console.log(e);
            }


        }, dataLoaded:function(data){
            try {
                highlightDuplicates (data);
            } catch (e) {
                console.log(e);
            }

        },
    });

    table.redraw();
//#endregion

(function () {
    'use strict';

    var csInterface = new CSInterface();
    // displayMsg("Rotating page 1 of 24382_49778_6_2sideBT_print1.pdf 90°...", "waiting");
    function init() {
                
        initColors();

        /** -----------------------------------------------------------------------------------
        ** Make a drop zone on body
        ** -----------------------------------------------------------------------------------
        * When a folder is hovered over the extension, allow for drop
        */
        //#region
            var holder = document.getElementById('drag-file'); // The body tag

            holder.ondragover = () => {
                // Show dot dot dot for drop
                var outlineStat = $("#drag-file").css("outline-width");
                if (outlineStat =="0px") {
                    $("#drag-file").css("outline-width", "1px").css("color", "#4affd4");
                }
        
                return false;
            };
        
            holder.ondragleave = () => {
                $("#drag-file").css("outline-width", "0px").css("color", "white");;
                return false;
            };
        
            holder.ondragend = () => {
                return false;
            };
        
            holder.ondrop = (e) => {
                e.preventDefault();
                // Hide the outline
                $("#drag-file").css("outline-width", "0px").css("color", "white");
                $("#drag-file")
                var t = 1;

                

                if (fs.lstatSync(e.dataTransfer.files[0].path).isDirectory()) {

                    // Is a folder
                    var folder = e.dataTransfer.files[0].path;
                    fs.readdir(e.dataTransfer.files[0].path, function (err, files) {
                        //handling error
                        if (err) {
                            return console.log('Unable to scan directory: ' + err);
                        }

                        var filesToAdd = [];

                        files.forEach(function (file) {
                            // If it's a PDF, add path to filesToAdd[]
                            
                            var ext = path.extname(file);
                            if (ext == ".pdf") {
                                // Is a PDF
                                filesToAdd.push(file);
                            }
                        });
                        addFilesToTable(filesToAdd, folder, "add");
                    });
                } else {
                    // Is a collection of files
                    var filesToAdd = [];

                    for (let f of e.dataTransfer.files) {
                        if (f.type != "application/pdf") {
                            console.log(f.path + " is not a PDF!");
                        } else {
                            // Is a PDF
                            filesToAdd.push(f.name);
                        }
                    }

                    var folder = path.dirname(e.dataTransfer.files[0].path);

                    // filesToAdd[] now contains a collection of file names to add to Tabulator
                    addFilesToTable(filesToAdd, folder, "add");

                }

                

            };
        //#endregion

        /** -----------------------------------------------------------------------------------
        ** Make a blank document on load
        ** 10/20/2021 - CHECK FOR GPU SETTING
        ** -----------------------------------------------------------------------------------
        * This prevents InDesign from defaulting ot the home screen
        * when the last document is closed. Just creates a dumb blank
        * document, to be discarded at any time
        * 
        * 10/20/21 - This function runs when the extension first opens
        * Here is where we will check for GPU setting and return it with
        * dumbDoc()'s rtn
        */
        //#region
            csInterface.evalScript('dumbDoc()', function(rtn) {
                console.log(rtn);
                if (rtn == "true") {
                    $("#gpu-text").text("GPU Performance is turned ON").css("color", "mediumseagreen");
                    $("#gpu-check").prop('checked', true);
                } else {
                    $("#gpu-text").text("GPU Performance is turned OFF").css("color", "crimson");
                    $("#gpu-check").prop('checked', true);
                }
            });
        //#endregion

        /** -----------------------------------------------------------------------------------
          ** Open Files Button (at the top) (!-- NO LONGER USED --!)
         ** -----------------------------------------------------------------------------------
         * Extendscript opens a dialog, and returns the folder path
         * node fs reads the folder, for each file builds a JSON
         * The JSON is used to 'replaceData' on the Tabulator table
         */
        //#region         
            // $("#btn_open").click(function () {
                
            //     csInterface.evalScript('openFolder("' + "Choose the folder containing your artwork" + '")', function(rtn) {
            //         // rtn is a path to the selected folder
            //         // Object for JSON to pass to tabulator
            //         // Loop files in directory
            //         // https://medium.com/stackfame/get-list-of-all-files-in-a-directory-in-node-js-befd31677ec5
            //         fs.readdir(rtn, function (err, files) {
            //             //handling error

            //             if (err) {
            //                 return console.log('Unable to scan directory: ' + err);
            //             }

            //             addFilesToTable(files, rtn, "replace");

            //             //Hide open files button
            //             $("#open-btn-area").slideToggle("slow");
            //             // console.log(table);
            //         });
            //     });
            // });
        //#endregion

        /** -----------------------------------------------------------------------------------
         ** Open Buttons
        ** -----------------------------------------------------------------------------------
        * Open the relevant template file and relink to the selected file
        * Assign relavent information to global variables
        */
        //#region
            $('body').on('click', '.open-button', function() {
                $("#invisible-options").slideDown("slow");

                // Extract information needed from the button's value
                var btnVal = $(this).val(); // Get value of button
                fileName = btnVal.split(";")[0]; // file name
                folderDir = btnVal.split(";")[1]; // folder name
                prodType = btnVal.split(";")[2]; // product type
                fileID = btnVal.split(";")[3]; // product type
                // console.log(fileID);
                // Assign file name to export buttons
                // This is used to delete the row when export button is pressed

                fullPath = folderDir + "/" + fileName; // /Users/toddshark/Desktop/DownloadAll_ToddMorris_537_artfiles/13204_46826_3_MENU_print2.pdf
                clientCode = fileName.split("_")[0]; // 13204

                // Create Barcode -----------------------------------------------------
                // Zint CLI: https://github.com/zint/zint must be in /usr/local/bin

                /**
                 * 10/20/2021 - REPLACING ZINT BARCODE FEATURES
                 * !-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!
                 */
                // barcodePath = (__dirname + "/zint/" + clientCode + ".eps");
                // var previewPath = (__dirname + "/zint/" + clientCode + ".svg"); // /Users/toddshark/Library/Application Support/Adobe/CEP/extensions/com.example.metrixday/zint/13204.eps
                // var zintCmd = "/usr/local/bin/zint -o \"" + barcodePath + "\" -b 71 -d \"" + clientCode + "\""
                // var prevCmd = "/usr/local/bin/zint -o \"" + previewPath + "\" -b 71 -d \"" + clientCode + "\"" // zint -o "/Users/toddshark/Library/Application Support/Adobe/CEP/extensions/com.example.metrixday/zint/13204.eps" -b 71 -d "13204"
                // exec(zintCmd, (err, stdout, stderr) => {
                //     if (err) {
                //         console.error(err)
                //         $("#cur-file").text("Something went wrong creating the barcode.");
                //     } else {
                //         // Update details area
                //         $("#cur-file").text(fileName);

                //         // Bring barcode preview in
                //         exec(prevCmd, (err, stdout, stderr) => {
                //             $("#bc-img").attr("src",previewPath);
                            
                //         });
                //     }

                // });

                // Determine page number
                // /usr/bin/mdls -name kMDItemNumberOfPages -raw "/Users/toddshark/Downloads/Download_ToddMorris_542_artfiles/1038_46196_8_MoBT_print1.pdf"
                var pageNumCmd = "/usr/bin/mdls -name kMDItemNumberOfPages -raw '" + fullPath + "'";
                exec(pageNumCmd, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err)
                        $("#cur-file").text("Something went wrong getting the page number.");
                    } else {
                        numPages = stdout;
                        if (numPages == "1") {
                            displayMsg("Warning! This document has 1 page!", "warning")
                        }
                        // JSON Lookup  -----------------------------------------------------
                        // JSON contains: MS System File Name (system_name), Document to use (prod_type), Name to rename to (rename_to) 
                        var json = JSON.parse(fs.readFileSync(__dirname + '/csvjson.json').toString());

                        for (var i=0; i<json.length; i++) {
                            if (prodType == json[i].system_name) {
                                inddFile = json[i].prod_type;
                                // Get the renameto from the table, not the json in case it was changed
                                renameTo = table.getRow(Number(fileID))._row.data.renameto;

                            }
                        }

                        // Unfortunately the plastics are NOT labeled in the system
                        // Therefore

                        // Send information to Extendscript  -----------------------------------------------------
                        // Builds an array of arguments. .join() combines them into a string.
                        // The string is passed to the openArtwork function in the JSX
                        
                        var args = [fullPath, barcodePath, __dirname, inddFile, numPages];

                        var strArgs = "\"" + args.join('\",\"') + "\""; // Args must be passed as strings inserted into function call
                        csInterface.evalScript('openArtwork(' + strArgs + ')', function(rtn) {

                            // Hide and reset all current options
                            $(".options").css("display", "none");

                            // Reset Menu Options ------------------------------------------------
                            //#region
                                $(".menu-choice").val("2019-c");
                                $("#barcode-label").prop("checked", true);
                                $("#indicia-label").prop("checked", false);
                                $("#coupon").prop("checked", true);
                            //#endregion

                            // Based on product type, make different options avialable
                            if (inddFile == "MENU.indt") {
                                $("#menu-options").css("display", "block");
                                $("#barcode-check-container").slideUp("slow");
                            } else if (inddFile == "PC.indt") {
                                $("#pc-options").css("display", "block");
                            } else if (inddFile == "XL.indt") {
                                $("#xlmenu-options").css("display", "block");
                            } else if (inddFile == "JUMBO.indt") {
                                $("#jumbopc-options").css("display", "block");
                            } else if (inddFile == "2SBT.indt") {
                                $("#2sbt-options").css("display", "block");
                                $("#barcode-check-container").css("display", "none");
                                $("#custom-barcode-container").css("display", "none");
                            } else if (inddFile == "MAG.indt") {
                                $("#mag-options").css("display", "block");
                            } else if (inddFile == "DH.indt") {
                                $("#dh-options").css("display", "block");
                            } else if (inddFile == "80#FL.indt") {
                                $("#80fl-options").css("display", "block");
                            } else if (inddFile == "FMAGDM.indt") {
                                $("#fmagdm-options").css("display", "block");
                            } else if (inddFile == "FMAGEDDM.indt") {
                                $("#fmageddm-options").css("display", "block");
                            } else if (inddFile == "COLOSSAL.indt") {
                                $("#colossal-options").css("display", "block");
                            } else if (inddFile == "SPL.indt") {
                                $("#spl-options").css("display", "block");
                                $("#just-barcode").css("display", "none");
                            } else if (inddFile == "MPL.indt") {
                                $("#mpl-options").css("display", "block");
                                $("#just-barcode").css("display", "none");
                            } else if (inddFile == "LPL.indt") {
                                $("#lpl-options").css("display", "block");
                                $("#just-barcode").css("display", "none");
                            };

                        
                            // If options are invisible
                            // if ($("#invisible-options").css("display") == "none") {
                                // Show invisible options -----------------------------------------------
                                // Supposed to slide but doesn't

                            // }

                        });
                    }
                });

                
                
            });
        //#endregion

        /** -----------------------------------------------------------------------------------
         ** Menu Choice is Changed
        ** -----------------------------------------------------------------------------------
        * Gets the value from the selected option, and sends to Extendscript to switch layers
        */
        //#region
        $(".menu-choice").change(function() {

            templateChoice = $(this).val();
            // Should figure out if a Coupon Fold option is checked
            // If one is, append x
            console.log(prodType);
            if (prodType == "XL") {
                if ($("#xl-coupon").is(":checked")) {
                } else {
                    templateChoice = templateChoice + "x";
                }
            } else {
                if ($("#coupon").is(":checked")) {
                } else {
                    templateChoice = templateChoice + "x";
                }
            }


            // Send information to Extendscript  -----------------------------------------------------
            // Builds an array of arguments. .join() combines them into a string.
            // The string is passed to the openArtwork function in the JSX
            csInterface.evalScript('changeMenuTemplate("' + templateChoice + '")', function(rtn) {
                // Don't forget to delete the barcode
                // I can do this on export

            });
        });
        //#endregion

        /** -----------------------------------------------------------------------------------
         ** Fold Correct Button is pressed
        ** -----------------------------------------------------------------------------------
        * Description here
        */
        //#region
        $(".foldCorrect").on('click', function() {

            templateChoice = $( "#menu-choice option:selected" ).val(); // 2017-c

            // Create fixed layer name based on template choice
            var splitChoice = templateChoice.split("-");
            var fixedLayer =splitChoice[0] + "FIX-" + splitChoice[1]
            // Conditionally, add X to end if mailing label option is selected!
            // If one is, append x
            if ($("#coupon").is(":checked")) {
            } else {
                fixedLayer = fixedLayer + "x";
            }

            // Send information to Extendscript  -----------------------------------------------------
            // Builds an array of arguments. .join() combines them into a string.
            // The string is passed to the openArtwork function in the JSX
            csInterface.evalScript('foldCorrect("' + fixedLayer + '")', function(rtn) {
                // Don't forget to delete the barcode
                // I can do this on export
                
                    $("#menu-options").css("display", "none");
                    $("#xlmenu-options").css("display", "none");
                    $("#barcode-check-container").slideDown("slow");
                    // $("#coupon-container").css("display", "none");
                    // $("#fold-correct-container").css("display", "none");
                    // $("#btn-export-container").css("display", "block");
            });
        });
        //#endregion

        /** -----------------------------------------------------------------------------------
         ** Direct Mail check box is checked
        ** -----------------------------------------------------------------------------------
        * Hides or Shows the Direct Mail and Barcodes
        */
        //#region        
        $('#barcode-label').change(function() {
            if($(this).is(":checked")) {
                // Show all dm labels
                var showHide = "show";
            } else {
                // Hide all labels
                var showHide = "hide";
            }

            var which = "barcode";
            csInterface.evalScript('showHideDMLabels("' + showHide + '", "' + which + '")', function(rtn) {


            });
        });
        //#endregion

        /** -----------------------------------------------------------------------------------
         ** Direct Mail check box is checked
        ** -----------------------------------------------------------------------------------
        * Hides or Shows the Direct Mail and Barcodes
        */
        //#region        
        $('#indicia-label').change(function() {
            if($(this).is(":checked")) {
                // Show all dm labels
                var showHide = "show";
            } else {
                // Hide all labels
                var showHide = "hide";
            }

            var which = "dm"
            csInterface.evalScript('showHideDMLabels("' + showHide + '", "' + which + '")', function(rtn) {


            });
        });

        //#endregion
        
        /** -----------------------------------------------------------------------------------
         ** Coupon Fold check box is checked
        ** -----------------------------------------------------------------------------------
        * Switches to coupon versions
        */
        //#region        
            $('#coupon').change(function() {

                // templateChoice = $(this).val();

                if ($(this).is(":checked")) {
                    templateChoice = templateChoice.substring(0, templateChoice.length - 1);
                } else {
                    templateChoice = templateChoice + "x";
                }
                csInterface.evalScript('changeMenuTemplate("' + templateChoice + '")', function(rtn) {
                    // Don't forget to delete the barcode
                    // I can do this on export

                });
            });
        //#endregion

        /** -----------------------------------------------------------------------------------
         ** XL Coupon Fold check box is checked
        ** -----------------------------------------------------------------------------------
        * Switches to coupon versions
        */
        //#region        
        $('#xl-coupon').change(function() {

            // templateChoice = $(this).val();

            if ($(this).is(":checked")) {
                templateChoice = templateChoice.substring(0, templateChoice.length - 1);
            } else {
                templateChoice = templateChoice + "x";
            }
            csInterface.evalScript('changeMenuTemplate("' + templateChoice + '")', function(rtn) {
                // Don't forget to delete the barcode
                // I can do this on export

            });
        });
    //#endregion

        /** -----------------------------------------------------------------------------------
         ** Add a Scratch Off button is pressed
        ** -----------------------------------------------------------------------------------
        * Adds a scratch-off box to page 1 of active document
        */
        //#region        
            $('.so-box').change(function() {

                // Is it a jumbo or a standard postcard?
                // Different geoBounds in jsx
                var myID = $(this).attr("id");


                if ($(this).is(":checked")) {
                    var onOffBool = "true";
                } else {
                    var onOffBool = "false";
                }

                csInterface.evalScript('addScratchOff("' + onOffBool + '", "' + myID + '")', function(rtn) {
                    
                });
            });
        //#endregion

        /** -----------------------------------------------------------------------------------
         ** Add a Peel Box button is pressed
        ** -----------------------------------------------------------------------------------
        * Adds a scratch-off box to page 1 of active document
        */
        //#region        
        $('.peel-box').change(function() {

            // Is it a jumbo or a standard postcard?
            // Different geoBounds in jsx
            var myID = $(this).attr("id");


            if ($(this).is(":checked")) {
                var onOffBool = "true";
            } else {
                var onOffBool = "false";
            }

            
            csInterface.evalScript('addScratchOff("' + onOffBool + '", "' + myID + '")', function(rtn) {
                
            });
        });
    //#endregion

        /** -----------------------------------------------------------------------------------
         ** Export button is pressed
        ** -----------------------------------------------------------------------------------
        * Exports active document to the right place with the right label
        */
        //#region
        $(".exportButton").on('click', function() {
            // send global about current document to ExtendScript
            // Export prints in the right place

                var dir = folderDir + "/Flattened";

                // Create a folder for this product if it doesn't exist
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }

                // Append correct template to end of renameTo for plastics
                // 10/20/2021 - REMOVED COUPON COUNT FEATURE
                // if (renameTo == "SPL") {
                //     var selectedTemplate = $("#spl-choice option:selected").val();
                //     // Uppercase value of selected option
                //     var upperName = selectedTemplate.toUpperCase();
                //     renameTo = renameTo + "_" + upperName;
                // } else if (renameTo == "MPL") {
                //     var selectedTemplate = $("#mpl-choice option:selected").val();
                //     // Uppercase value of selected option
                //     var upperName = selectedTemplate.toUpperCase();
                //     renameTo = renameTo + "_" + upperName;
                // } else if (renameTo == "LPL") {
                //     var selectedTemplate = $("#lpl-choice option:selected").val();
                //     // Uppercase value of selected option
                //     var upperName = selectedTemplate.toUpperCase();
                //     renameTo = renameTo + "_" + upperName;
                // };
                

                // Make file name for PDF
                var pdfFile = dir + "/" + clientCode + "_" + renameTo + ".pdf";

                // Deterimine which row was clicked from, remove it from Tabulator
               
                if (boolColor == false) {
                    var delRow = table.getRow(fileID);
                    delRow.getElement().style.backgroundColor = "#3CB371"
                }

                table.redraw();

                

                csInterface.evalScript('exportPDF("' + pdfFile + '", "' + __dirname + '", "' + renameTo + '", "' + globPreset + '", "' + numPages + '")', function(rtn) {
                    // Reset the visibility of options turn off on open
                    boolColor = false;
                    $("#barcode-check-container").css("display", "block");
                    $("#custom-barcode-container").css("display", "block");
                    $("#just-barcode").css("display", "block");
                    $("#invisible-options").slideUp("slow");
                    $("#follow-label").prop('checked',false);
                    $("#reason").val("");
                    
                });


        });
        //#endregion
        
        
        /** -----------------------------------------------------------------------------------
         ** Flip Pages buttton is pressed
        ** -----------------------------------------------------------------------------------
        * Exports active document to the right place with the right label
        */
        //#region
            $(".flip-pages").on('click', function() {
                csInterface.evalScript('flipPages()', function(rtn) {
                    
                });
            });
        //#endregion
        
        /** -----------------------------------------------------------------------------------
         ** Update Barcode is pressed
        ** -----------------------------------------------------------------------------------
        * Create a new custom barcode, and relink barcode in active document
        */
        //#region
        $("#update-barcode").on('click', function() {

            var newCode = $("#custom-barcode").val();
            // Create Barcode -----------------------------------------------------
            // Zint CLI: https://github.com/zint/zint must be in /usr/local/bin
            
            var barcodePath = (__dirname + "/zint/" + newCode + ".eps"); // /Users/toddshark/Library/Application Support/Adobe/CEP/extensions/com.example.metrixday/zint/13204.eps
            var zintCmd = "/usr/local/bin/zint -o \"" + barcodePath + "\" -b 71 -d \"" + newCode + "\"" // zint -o "/Users/toddshark/Library/Application Support/Adobe/CEP/extensions/com.example.metrixday/zint/13204.eps" -b 71 -d "13204"
            exec(zintCmd, (err, stdout, stderr) => {
                if (err) {
                    console.error(err)
                }
            });
            csInterface.evalScript('updateBarcode("' + barcodePath + '")', function(rtn) {
                
            });
        });
    //#endregion

        /** -----------------------------------------------------------------------------------
         ** Sources button is pressed
        ** -----------------------------------------------------------------------------------
        * Open __dirname
        */
        //#region
            $('body').on('click', '#sources', function() {
                exec(("open \"" + __dirname + "/indd\""), (err, stdout, stderr) => {
                    if (err) {
                        console.error(err)
                    }
                });
            })
        //#endregion

        /** -----------------------------------------------------------------------------------
         ** Download CSV button is pressed
        ** -----------------------------------------------------------------------------------
        * Convert csvjson.json to csv & save
        */
        //#region
            $('body').on('click', '#csv-down', function() {
                
                var headers = {
                    system_name: "system_name",
                    prod_type: "prod_type",
                    rename_to: "rename_to"
                }
                var json = JSON.parse(fs.readFileSync(__dirname + '/csvjson.json').toString());
                
                var itemsFormatted = [];

                json.forEach((item) => {
                    itemsFormatted.push({
                        system_name: item.system_name,
                        prod_type: item.prod_type,
                        rename_t0: item.rename_to
                    });
                });

                try {
                    exportCSVFile(headers, itemsFormatted, "csvjson");
                } catch (e) {console.log(e)};


            })
        //#endregion
        
        /** -----------------------------------------------------------------------------------
         ** Rotate PDF Button is pressed
        ** -----------------------------------------------------------------------------------
        * Rotates the links for the requested page
        */
        //#region
            $(".btn-rotate").on("click", function () {

                // Show working message

                var thisID = $(this).attr("id");
                var splitID = thisID.split("-");

                if (splitID[0] == "page1") {
                    var rotPage = "1";
                } else {
                    var rotPage = "2";
                }

                if (splitID[1] == "clock") {
                    var rotDeg = "90";
                } else {
                    var rotDeg = "270";
                }

                displayMsg("Rotating page " + rotPage + " of " + fileName + "\n" + rotDeg + "° clockwise...", "waiting");

                // Make a rot folder for new pdf
                if (!fs.existsSync(folderDir + "/rot")){
                    fs.mkdirSync(folderDir + "/rot");
                }

                // Sejda SDK
                // http://sejda.org/
                var pdfPath = folderDir + "/" + fileName;


                var sejdaCmd = sejda + " rotate --rotation " + rotDeg + " --files \"" + pdfPath + "\" --output \"" + folderDir + "/rot\" --pageSelection " + rotPage;

                exec(sejdaCmd, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err)
                    }
                    // Done rotating...
                    // Overwrite old file with new
                    var newFile = folderDir + "/rot/" + fileName;
                    fs.renameSync(newFile, pdfPath);

                    // Close active document, openArtwork again
                    var args = [fullPath, barcodePath, __dirname, inddFile];
                    var strArgs = "\"" + args.join('\",\"') + "\"";
                    csInterface.evalScript('resetDoc(' +  strArgs + ')', function(rtn) {
                            
                    });
                    

                    fs.remove(folderDir + "/rot")

                    // Hide ther working message
                    hideMsg() ;

                });
                

                

            });
        //#endregion 

        /** -----------------------------------------------------------------------------------
         ** Rotate INDD Button is pressed
        ** -----------------------------------------------------------------------------------
        * Rotates the page in InDesign
        */
        //#region
        $(".btn-rotate-indd").on("click", function () {

            // Show working message

            var thisID = $(this).attr("id");
            var splitID = thisID.split("-");

            var strArgs = "\"" + splitID.join('\",\"') + "\"";
            csInterface.evalScript('rotPage(' + strArgs + ')', function(rtn) {
                        
            });

        });
    //#endregion 


        /** -----------------------------------------------------------------------------------
        **  Upload CSV button is pressed
        ** -----------------------------------------------------------------------------------
        * Convert the CSV to JSON and overwrite csvjson.json
        */
        //#region
        $('body').on('click', '#csv-up',  function() {
                csInterface.evalScript('openFile("' + "Choose the CSV file to upload..." + '")', function(rtn) {
                    // https://www.npmjs.com/package/csvtojson
                    csv().fromFile(rtn).then((jsonObj) => {
                        fs.writeFileSync(__dirname + '/csvjson.json', JSON.stringify(jsonObj));
                    });
                });
            })
        //#endregion
        }
        
        /** -----------------------------------------------------------------------------------
        ** Show Rotation Tools button is pressed
        ** -----------------------------------------------------------------------------------
        * Shows / Hides rotation tools
        */
        //#region
            $("#btn-rotations").on("click", function(){

                $("#rotate-tool").slideToggle("slow");  // Creates an accordion

                // Update button's text
                if ($(this).val() == "false") {
                    $(this).text("Hide Rotation Tools")
                    $(this).val("true");
                } else {
                    $(this).text("Show Rotation Tools")
                    $(this).val("false");
                }

            });

        //#endregion
        
        /** -----------------------------------------------------------------------------------
        ** Download Table button is pressed
        ** -----------------------------------------------------------------------------------
        * Downloads the table's json data as csv
        */
        //#region
        $('body').on('click', '#report',  function() {
                // Export CSV here

                var headers = {
                    id: "ID",
                    file: "Filename",
                    prod: "Product",
                    folder:"Folder",
                    follow: "Follow Up"
                }
                var json = table.getData();;
                
                var itemsFormatted = [];
    
                json.forEach((item) => {
                    itemsFormatted.push({
                        id: item.id,
                        file: item.file,
                        prod: item.prod,
                        folder: item.folder,
                        follow: item.follow.replace(/,/g, '')
                    });
                });
    
                try {
                    exportCSVFile(headers, itemsFormatted, "Report");
                } catch (e) {console.log(e)};

            })
        //#endregion

        /** -----------------------------------------------------------------------------------
        ** Tabulator Group is expanded / collapsed
        ** -----------------------------------------------------------------------------------
        * Prints the Tabulator table
        */
        //#region
            $('body').on('click', 'div.tabulator-group', function() {
                table.redraw();
            });
        //#endregion

        /** -----------------------------------------------------------------------------------
        ** Mark for Follow-Up is clicked
        ** -----------------------------------------------------------------------------------
        * Turns a follow-up bool true, used in Export Button
        */
        //#region
            $('#follow-label').change(function() {
                
                // templateChoice = $(this).val();
                var delRow = table.getRow(fileID);

                var evenOrOdd = delRow.getElement().classList[2];


                if (evenOrOdd == "tabulator-row-odd") {
                    var initColor = "#666";
                } else {
                    var initColor = "#444";
                }

                if ($(this).is(":checked")) {

                    $("#reason-container").slideDown("slow");
                    boolColor = true;
                    delRow.getElement().style.backgroundColor = "#ec61f8"
                    table.redraw();

                } else {
                    $("#reason-container").slideUp("slow");
                    boolColor = false;
                    delRow.getElement().style.backgroundColor = initColor;
                    table.updateData([{
                        id:fileID,
                        follow:""
                        }]);
                    table.redraw();
                }
                
            });
        //#endregion



        /** -----------------------------------------------------------------------------------
        ** Reason's Close Button is pressed
        ** -----------------------------------------------------------------------------------
        * Closes the current document without saving
        */
        //#region
            $("#follow-close").on("click", function() {
                boolColor = false;
                csInterface.evalScript('closeDoc()', function(rtn) {
                    // Reset extension
                    $("#barcode-check-container").css("display", "block");
                    $("#custom-barcode-container").css("display", "block");
                    $("#invisible-options").slideUp("slow");
                    $("#follow-label").prop('checked',false);
                    $("#reason").val("");
                    $("#reason-container").slideUp("slow");
                });

            });
        //#endregion

        /** -----------------------------------------------------------------------------------
        ** Settings button is pressed
        ** -----------------------------------------------------------------------------------
        * Displays custom message which dynamically loads settings buttons
        * Hides the settings button
        */
         //#region
            $("#settings-button").on("click", function() {
                displayMsg ("", "settings");
                $(this).css("display", "none");
            });
        //#endregion

        /** -----------------------------------------------------------------------------------
        ** Any button in Settings is pressed
        ** -----------------------------------------------------------------------------------
        * Closes the settings area
        * Shows the settings button
        */
         //#region
            $('body').on('click', '.set-buttons',  function() {
                $("#display-message").fadeOut("fast");
                $("#settings-button").css("display", "block");
            })
        //#endregion

        /** -----------------------------------------------------------------------------------
        ** Close Warning button is pressed
        ** -----------------------------------------------------------------------------------
        * Closes the settings area
        * Shows the settings button
        */
         //#region
         $('body').on('click', '#warning',  function() {
            $("#display-message").fadeOut("fast");
            $("#settings-button").css("display", "block");
        })
    //#endregion
        
        /** -----------------------------------------------------------------------------------
        ** Choose PDF Export is pressed
        ** -----------------------------------------------------------------------------------
        * Closes the settings area
        * Shows the settings button
        */
        //#region
            $('body').on('click', '#pdf-export',  function() {
                csInterface.evalScript('getExports()', function(rtn) {
                    fs.writeFileSync(__dirname + "/pdfPreset.txt",rtn,{encoding:'utf8',flag:'w'})
                    globPreset = rtn;
                });
            });
        //#endregion
        
        /** -----------------------------------------------------------------------------------
        ** 2020 Update: Custom Year "Update" is pressed
        ** -----------------------------------------------------------------------------------
        * Shows and updates the year override
        */
        //#region
        $("#update-year").on("click", function() {
            var whatYear = $("#custom-year").val();
            // Send the year to jsx, show new year layer and relace <<yr>>
            // Don't forget to add hide function
            csInterface.evalScript('showYear(' + whatYear + ')', function(rtn) {
                // console.log(rtn);
            });

        })
        //#endregion

        /** -----------------------------------------------------------------------------------
        ** 2020 Update: Hide the Custom Year
        ** -----------------------------------------------------------------------------------
        * Hides the year override fix
        */
        //#region
        $("#hide-year").on("click", function() {
            csInterface.evalScript('hideYear()', function(rtn) {
                // console.log(rtn);
            });
        })
        //#endregion

        /** -----------------------------------------------------------------------------------
        ** 2020 Update: Add a generic Client Code to the page
        ** -----------------------------------------------------------------------------------
        * Adds a client code to the page
        */
        //#region
        $("#btn-clientCode").on("click", function() {
            csInterface.evalScript('addCode()', function(rtn) {
                // console.log(rtn);
            });
        })
        //#endregion


        /**
         * 10/20/2021 - GPU TOGGLE CHECKBOX
         * When the check box is changed, either disable or enable the
         * GPU settings based on checkbox :checked
         */

        $("#gpu-check").on("change", function() {
            if ($(this).prop("checked") == true) {
                console.log("turn ON the GPU settings");
                csInterface.evalScript('toggleGPU("true")', function(rtn) {
                    // console.log(rtn);
                    $("#gpu-text").text("GPU Performance is turned ON").css("color", "mediumseagreen");
                });
            } else {
                csInterface.evalScript('toggleGPU("false")', function(rtn) {
                    // console.log(rtn);
                    $("#gpu-text").text("GPU Performance is turned OFF").css("color", "crimson");

                });
            }
        })

    init();

}());

/** -----------------------------------------------------------------------------------
** Remove Group button is pressed
** -----------------------------------------------------------------------------------
* Removes every row with a matching value
* @param {string} value Group to remove
*/
//#region
    function delGroup (value) {
        // value = "EDDMPPC"

        // Get the rows containing the value
        var tableData = table.getRows().filter(function(row) {
            return row.getData().prod == value;
        });

        // Delete em
        tableData.forEach(function(item) {
            item.delete();
        });
        
        resetTable(function(newData) {
            highlightDuplicates (newData);
        });

        // Breaks addFilesToTable() !!!

        // We need to reset the IDs

    }
//#endregion

/** -----------------------------------------------------------------------------------
** Display a message
** -----------------------------------------------------------------------------------
* Displays a message to user of predetermined type 
* @param {string} textMsg Text to display
* @param {string} msgType Type of message to display
*/
//#region
    
    function displayMsg (textMsg, msgType) {

        $("#display-message").fadeIn("fast").css("display", "grid");
        if (msgType == "waiting") {
            $("#msg-img").empty().append(`
                <img src="svg-loaders/ball-triangle.svg" width="50px" />
            `)
            $("#msg-txt").text(textMsg);
        } else if (msgType == "settings") {
            $("#msg-img").empty().append(`
                <button class="btn-big ccstyle hostFontSize set-buttons" id="reload">Reload</button>
                <button class="btn-big ccstyle hostFontSize set-buttons" id="debug">Debug</button>
                <button class="btn-big ccstyle hostFontSize set-buttons" id="sources">Sources</button> 
                <button class="btn-big ccstyle hostFontSize set-buttons" id="csv-down">Download CSV</button> 
                <button class="btn-big ccstyle hostFontSize set-buttons" id="csv-up">Upload CSV</button> 
                <button class="btn-big ccstyle hostFontSize set-buttons" id="report">Download Table</button> 
                <button class="btn-big ccstyle hostFontSize set-buttons" id="pdf-export">Set PDF Export</button>
                <button class="btn-big ccstyle hostFontSize set-buttons" id="return">Return</button> 
            `)

            $("#msg-txt").css("display", "none");
        } else if (msgType == "warning") {
            $("#msg-img").empty().append(`
                <i class="fas fa-exclamation-triangle fa-3x"></i>
            `)
            $("#msg-txt").text(textMsg).append(`
                <br /><button class="btn-big ccstyle hostFontSize warn-buttons" id="warning">Close</button>
            `);

        }

    };
//#endregion

/** -----------------------------------------------------------------------------------
** Hide a message
** -----------------------------------------------------------------------------------
* Displays a message to user of predetermined type 
*/
//#region       
    function hideMsg () {
        $("#msg-img").empty()
        $("#display-message").css("display", "none");
        $("#msg-txt").text("");
    };

//#endregion
/** -----------------------------------------------------------------------------------
**  Convert JSON file to CSV
** -----------------------------------------------------------------------------------
* https://medium.com/@danny.pule/export-json-to-csv-file-using-javascript-a0b7bc5b00d2
* My edit: Use jsx to choose folder, and write csv to that folder
*/
//#region
    function convertToCSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '';

        for (var i = 0; i < array.length; i++) {
            var line = '';
            for (var index in array[i]) {
                if (line != '') line += ','

                line += array[i][index];
            }

            str += line + '\r\n';
        }

        return str;
    }

    function exportCSVFile(headers, items, fileTitle) {
        if (headers) {
            items.unshift(headers);
        }

        // Convert Object to JSON
        var jsonObject = JSON.stringify(items);

        var csv = this.convertToCSV(jsonObject);

        csInterface.evalScript('openFolder("' + "Where do you want to put the CSV file?" + '")', function(rtn) {

            // Write csv to this folder
            fs.writeFile(rtn + '/jsoncsv.csv', csv, (err) => {
                
                // Open in Excel when written
                exec(("open \"" + rtn + "/jsoncsv.csv\""), (err, stdout, stderr) => {
                    if (err) {
                        console.error(err)
                    }
                });      
            });
        });

    }
//#endregion


/** -----------------------------------------------------------------------------------
** Something is typed into Reason's textarea
** -----------------------------------------------------------------------------------
* Fires on every keyup
* Updates the row's follow field with whatever the current value of the textarea is
*/
//#region
    function reasonChange() {
        var reasonText = $("#reason").val();
        table.updateData([{
            id:fileID,
            follow:reasonText
            }]);
    };
//#endregion

/** -----------------------------------------------------------------------------------
** Add a collection of files into Tabulator
** -----------------------------------------------------------------------------------
* Displays a message to user of predetermined type
* @param {array} Files An array of file names to add to Tabulator
* @param {string} folder The parent folder of the files
* @param {string} addOrReplace If "Replace", table.replaceData is used. Otherwise, table.addData is used
*/
//#region
    function addFilesToTable (someFiles, folder ,addOrReplace) {

        var tJSON = [];
        // Reset the clientCodes list
        clientCodes = [];

        //Get the last ID in the table
        var tableData = table.getData();
        
        try {
            var x = Number(tableData[tableData.length - 1].id) + 1;
        } catch (e) {
            var x = 0;
        }

        //in prep for determining the rename-to file name
        var json = JSON.parse(fs.readFileSync(__dirname + '/csvjson.json').toString());
        console.log(someFiles)
        for (y=0; y < someFiles.length; y++) {
            var file = someFiles[y];
            console.log(file)
            // We need a folder path

            // get product name
            if (file.split(".")[1] == "pdf"){
                console.log(sFile)
                var sFile = file.split("_");
                if (sFile[3] == "LET" || sFile[3] == "8") {
                    var prod = sFile[3] + "_" + sFile[4];
                } else {
                    var prod = sFile[3];
                }
                
                // var prod = sFile[1].split(".")[0];
                var cCode = sFile[0];

                // Builds a list of client codes and associated IDs for this session
                clientCodes.push({
                    clientCode: cCode,
                    id:x,
                    prod:prod
                });                                
                
                // If there's no product in the file name, label as 'Unknown Product Type'
                if (prod.includes("print")) {
                    prod = "Unknown Product Type";
                }

                // Let's try to determine what the rename-to filename is here
                for (var i=0; i<json.length; i++) {
                    if (prod == json[i].system_name) {
                        var tempRename = (json[i].rename_to);
                    }
                }


                // Add to JSON object that gets passed
                // to Tabulator
                // Only pass if not already in table
                if (table.getData().length == 0) {
                    tJSON.push({ id: x, file: file, prod: prod, renameto: tempRename, folder: folder, follow:""});
                } else {
                    var isIn = false;
                    for (var z = 0; z<tableData.length; z++) {
                        if (tableData[z].file == file) {
                            // Already in table
                            isIn = true;
                        }
                    }
                    if (isIn == false) {
                        // No duplicates found
                        
                        tJSON.push({ id: x, file: file, prod: prod, renameto: tempRename, folder: folder, follow:""});
                    }
                }

                

                x++;
            }

        };

        table.updateOrAddData(tJSON).then(function() {
                    // table.redraw(true);
        });
        // if (table.getData().length == 0) {
            
        // } else {
        //     var curData = table.getData();


        //     table.updateOrAddData(tJSON).then(function() {
        //         // table.redraw(true);
        //     });
        // };

    }
//#endregion

/** -----------------------------------------------------------------------------------
** Highlight Duplicate Rows in Tabulator Data Set
** -----------------------------------------------------------------------------------
* Displays a message to user of predetermined type
* @param {array} data Data from tabulator data callbacks
*/
//#region
    function highlightDuplicates (data) {
        /**
                 * If the count of the client code is > 1, highlight that and this's row
                 */
                // data is an array of json objects,
                // loop through those...
                var ids = [];
                for (var x = 0; x<data.length; x++) {
                    var cCode = data[x].file.split("_")[0];
                    var cLine = data[x].file.split("_")[2]; // Line number of file
                    var cProd = data[x].prod;
                    var count = 0;
                    var myID = x;

                    // table.getRow(myID).getElement().style.backgroundColor = "#444";
                    // table.getRow(myID).getElement().style.backgroundColor = "#444";
                    table.getRow((myID)).reformat();
                   
                    // Count the number of duplicates
                    for (var i=0; i<clientCodes.length; i++) {
                        if (clientCodes[i].clientCode == cCode && clientCodes[i].prod == cProd) {
                            count++;
                        }

                        // If the count is more than 1, add to ids list
                        if (count > 1) {
                            ids.push({
                                id: myID,
                                newName: cProd + "_" + cLine
                            });
                            count=0;
                        }
                    }
                };
                // ids list now has a list of rows that have duplicates
                for (i=0; i<ids.length; i++) {
                    // Try to highlight row because it has a duplicate
                    var theID = ids[i].id;
                    table.getRow(theID).getElement().style.backgroundColor = "#99cc00";
                    // Change the renameTo values to append line number
                    try {
                        table.updateData([{id: theID, renameto:ids[i].newName}]);
                    } catch(e) {
                        console.log(e);
                    }
                }
                table.redraw();
    }


//#endregion

/** -----------------------------------------------------------------------------------
** Reset IDs in Table to 0 -> length of table
** -----------------------------------------------------------------------------------
* Resets the IDs of the table content to be 0 -> length of table
* The IDs are being reset unpredictably, so it's nice to force-reset them
*/
//#region
    function resetTable (callback) {
        var newData = [];
        var data = table.getData();
        var x = 0;
        data.forEach(function(item) {
            item.id = x;
            newData.push(item);
            x++
        });
        table.setData(newData);
        callback(newData);
    }
//#endregion


/** -----------------------------------------------------------------------------------
** Boilerplate
** -----------------------------------------------------------------------------------
* Copy / Paste for quick functions
*/

/*

/** -----------------------------------------------------------------------------------
** Something is triggered
** -----------------------------------------------------------------------------------
* This code runs
*/

/*


//#region
    function myFunc () {

        var args = [arg1, arg2, arg3, arg4];
        var strArgs = "\"" + args.join('\",\"') + "\"";
        
        csInterface.evalScript('myFunc(' + strArgs + ')', function(rtn) {
                        
        });

    };
//#endregion 

 */
