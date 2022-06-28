import { Component } from 'react';
import ReactHtmlParser from 'react-html-parser';


let captcha_value = '';
let captcha_number = '';
let LoadCanvasTemplate_HTML = "<div><canvas id=\"canv\"></canvas><div><a id=\"reload_href\"  style=\"cursor: pointer; color: blue\">Reload Characters</a></div></div>";
let LoadCanvasTemplateNoReload_HTML = "<div><canvas id=\"canv\"></canvas><div><a id=\"reload_href\"  style=\"cursor: pointer; color: blue\"></a></div></div>";;

/**
 *  Creates a random value for captcha test.
 * @returns random value for captcha test.
 */

export const loadCaptchaEnginge = (numberOfCharacters) => {

    captcha_number = numberOfCharacters;
    let length = parseInt(numberOfCharacters),


        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }

    let captcha = retVal;

    captcha_value = captcha;



    let length_height_canvas = Math.round(parseInt(length) / 3);

    let canvas = document.getElementById('canv'),
        ctx = canvas.getContext('2d'),
        img = document.getElementById('image');
    let text = captcha;
    let x = 12.5;
    let y = 15;
    let lineheight = 110;
    let canvas_height = (parseInt(length) - parseInt(length_height_canvas)) * 20;
    let lines = text.split('\n');
    let lineLengthOrder = lines.slice(0).sort(function (a, b) {
        return b.length - a.length;
    });
    ctx.canvas.width = parseInt(length) * 120;
    ctx.canvas.height = (lines.length * lineheight);


    // ctx.fillRect(40, 1, canvas.width, canvas.height);

    ctx.textBaseline = "middle";
    ctx.font = "italic 60px Arial";
    ctx.fillStyle = "#212121";

    let num = 0;
    for (let i = 0; i < parseInt(length); i++) {
        num = parseInt(num) + 1;
        let heigt_num = 100 * num;
        ctx.fillText(retVal[i], heigt_num, Math.round(Math.random() * (15 - 12) + 35));
    }

    document.getElementById("reload_href").onclick = function () {
        loadCaptchaEnginge(captcha_number)
    }
};

/**
 * Checks if the inputted value matches captcha
 * @param userValue The user input
 * @param reload The new captcha value after reloading.
 * @returns True if the input mathces the capatcha and false otherwise
 */
export const validateCaptcha = (userValue, reload = true) => {
    if (userValue != captcha_value) {
        if (reload == true) {
            loadCaptchaEnginge(captcha_number);
        }

        return false;
    }

    else {
        return true;
    }
};
/**
 *  Makes it possible to reload the captcha value.
 * @returns a new captcha value.
 */
export class LoadCanvasTemplate extends Component {

    render() {
        return (ReactHtmlParser(LoadCanvasTemplate_HTML));
    }

};

/**
 * Makes it possible to choose not to relode the captcha. (Not used right now)
 *  @returns the same captcha value.
 */
export class LoadCanvasTemplateNoReload extends Component {

    render() {
        return (ReactHtmlParser(LoadCanvasTemplateNoReload_HTML));
    }

};