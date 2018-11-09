import { cssValues } from '../guide.style.js';
import { createGlContext, drawLineStrip, updateVertexBuffer } from './gl.js';

export class ChartElement extends HTMLElement {
    constructor() {
        super();
 
        this.data = [];
 
        const shadowRoot = this.attachShadow({ mode: 'open' });
 
        // We define some inline styles using a template string
        const styles=`
            :host {
                font-family: ${cssValues.fontFamily};
                display: block;
            }     

            #canvas {
                height: 100%;
                width: 100%;
                display: block;
            }     
        `;
 
        shadowRoot.innerHTML = `
            <style>${styles}</style>
            <canvas id="canvas" />
        `;
 
        this.canvas = shadowRoot.querySelector('#canvas');
        this.canvas.height = this.canvas.clientHeight;
        this.canvas.width = this.canvas.clientWidth;        
        this.glContext = createGlContext(this.canvas, window.screen.width);

        this._watchResize();
        
        drawLineStrip(this.glContext);
    }

    _watchResize() {
        const ro = new ResizeObserver(entries => {
            for (let entry of entries) {
              const cr = entry.contentRect;
              this.canvas.height = cr.height;
              this.canvas.width = cr.width;

              drawLineStrip(this.glContext);
            }
        });
        ro.observe(this.canvas);
    }

    setRenderData(yCoordinates) {
        updateVertexBuffer(this.glContext, yCoordinates);

        this.data = yCoordinates;

        drawLineStrip(this.glContext);
    }

}

customElements.define('chart-element', ChartElement);