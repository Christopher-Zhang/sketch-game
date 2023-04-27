/**
* Utility functions for HTML canvas
*/


export function setCanvasDimensions (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    console.log("resetting");
    if (!canvas) {
        console.error("ERROR COULD NOT FIND CANVAS");
        return [0,0,0,0];
    }
    // fix the stretch by CSS
    // console.log(`OLD: width ${canvas.width} height ${canvas.height}`);
    let adjustedWidth = canvas.parentElement?.clientWidth as number;
    let adjustedHeight = canvas.parentElement?.clientHeight as number;
    let scaleX = adjustedWidth / canvas.width;
    let scaleY = adjustedHeight / canvas.height;
    // TODO fix scaling
    console.log(`scalex: ${scaleX} scaley: ${scaleY}`);
    ctx.scale(scaleX, scaleY);
    let image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = adjustedWidth;
    canvas.height = adjustedHeight;
    console.log(`NEW width ${adjustedWidth} height ${adjustedHeight}`);
    let canvasOffsetX = canvas.offsetLeft;
    let canvasOffsetY = canvas.offsetTop;
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;
    // console.log(`left: ${canvasOffsetX}, top: ${canvasOffsetY}`);
    // console.log(`w: ${canvasWidth}, h: ${canvasHeight}`);
    ctx.putImageData(image as ImageData, 0, 0);
    return [canvasOffsetX, canvasOffsetY, canvasWidth, canvasHeight];
}

export function clearCanvas (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    if (!canvas || !ctx) {
        console.error("COULD NOT FIND CANVAS")
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log("Cleared canvas!");
};