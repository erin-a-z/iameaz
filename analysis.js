/**
 * Real Analysis Visualizer
 * Modular structure to allow easy extension.
 */

const App = {
    init() {
        WeierstrassModule.init();
        EpsilonDeltaModule.init();
        RiemannModule.init();
        TaylorModule.init();
    }
};

/**
 * Module 1: Weierstrass Function
 * f(x) = sum(a^n * cos(b^n * pi * x))
 */
const WeierstrassModule = {
    canvas: null,
    ctx: null,
    width: 600,
    height: 400,
    params: {
        a: 0.5,
        b: 7,
        zoom: 1,
        offsetX: 0 // For panning
    },

    init() {
        this.canvas = document.getElementById('weierstrassCanvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.bindEvents();
        this.render();
    },

    bindEvents() {
        const pA = document.getElementById('paramA');
        const pB = document.getElementById('paramB');
        const pZoom = document.getElementById('zoomLevel');
        const btnReset = document.getElementById('resetWeierstrass');

        pA.addEventListener('input', (e) => {
            this.params.a = parseFloat(e.target.value);
            document.getElementById('valA').textContent = this.params.a;
            this.render();
        });

        pB.addEventListener('input', (e) => {
            this.params.b = parseInt(e.target.value);
            document.getElementById('valB').textContent = this.params.b;
            this.render();
        });

        pZoom.addEventListener('input', (e) => {
            this.params.zoom = parseFloat(e.target.value);
            document.getElementById('valZoom').textContent = this.params.zoom + 'x';
            this.render();
        });

        btnReset.addEventListener('click', () => {
            this.params.zoom = 1;
            this.params.offsetX = 0;
            pZoom.value = 1;
            document.getElementById('valZoom').textContent = '1x';
            this.render();
        });

        // Simple panning
        let isDragging = false;
        let lastX = 0;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - lastX;
            lastX = e.clientX;
            // Adjust offset based on zoom to keep panning speed natural
            this.params.offsetX -= dx / (100 * this.params.zoom);
            this.render();
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });
    },

    weierstrass(x) {
        let sum = 0;
        const { a, b } = this.params;
        // 100 iterations is usually enough for visual convergence
        for (let n = 0; n < 100; n++) {
            sum += Math.pow(a, n) * Math.cos(Math.pow(b, n) * Math.PI * x);
        }
        return sum;
    },

    render() {
        const { ctx, width, height } = this;
        const { zoom, offsetX } = this.params;

        ctx.clearRect(0, 0, width, height);

        // Draw axes
        ctx.beginPath();
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        // X-axis
        const centerY = height / 2;
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        // Y-axis (approximate center of view)
        const centerX = width / 2;
        // We want to draw the axis relative to the offset
        // ScreenX = (WorldX - OffsetX) * Scale + CenterX
        // So if WorldX = 0, ScreenX = (-OffsetX) * Scale + CenterX
        const yAxisX = (-offsetX) * (100 * zoom) + centerX;
        ctx.moveTo(yAxisX, 0);
        ctx.lineTo(yAxisX, height);
        ctx.stroke();

        // Draw Function
        ctx.beginPath();
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 1.5;

        // We iterate over PIXELS to ensure we catch the high-frequency details
        // Instead of iterating world coordinates
        for (let px = 0; px < width; px++) {
            // Convert pixel x to world x
            // px = (wx - offX) * scale + cw
            // wx = (px - cw) / scale + offX
            const scale = 100 * zoom;
            const wx = (px - width / 2) / scale + offsetX;

            const wy = this.weierstrass(wx);

            // Convert world y to pixel y
            // py = cy - wy * scale (minus because canvas Y is down)
            const py = height / 2 - wy * 50; // Fixed vertical scale for now

            if (px === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
    }
};

/**
 * Module 2: Epsilon-Delta Game
 * Visualizing limit of f(x) at c
 */
const EpsilonDeltaModule = {
    canvas: null,
    ctx: null,
    width: 600,
    height: 400,
    params: {
        c: 2,
        epsilon: 0.5,
        delta: 0.5
    },

    init() {
        this.canvas = document.getElementById('epsilonCanvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.bindEvents();
        this.render();
    },

    bindEvents() {
        const pC = document.getElementById('paramC');
        const pEps = document.getElementById('paramEpsilon');
        const pDel = document.getElementById('paramDelta');

        pC.addEventListener('input', (e) => {
            this.params.c = parseFloat(e.target.value);
            document.getElementById('valC').textContent = this.params.c;
            this.render();
        });

        pEps.addEventListener('input', (e) => {
            this.params.epsilon = parseFloat(e.target.value);
            document.getElementById('valEpsilon').textContent = this.params.epsilon;
            this.render();
        });

        pDel.addEventListener('input', (e) => {
            this.params.delta = parseFloat(e.target.value);
            document.getElementById('valDelta').textContent = this.params.delta;
            this.render();
        });
    },

    // Example function: f(x) = 0.5 * x^2
    f(x) {
        return 0.5 * x * x;
    },

    render() {
        const { ctx, width, height } = this;
        const { c, epsilon, delta } = this.params;
        const L = this.f(c);

        ctx.clearRect(0, 0, width, height);

        // Coordinate system setup
        const scaleX = 50;
        const scaleY = 50;
        const originX = width / 2;
        const originY = height - 50; // Shift origin down

        const toScreenX = (x) => originX + x * scaleX;
        const toScreenY = (y) => originY - y * scaleY;

        // Draw Axes
        ctx.beginPath();
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.moveTo(0, originY);
        ctx.lineTo(width, originY); // X axis
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, height); // Y axis
        ctx.stroke();

        // Draw Epsilon Band (Horizontal)
        // y range: [L - eps, L + eps]
        const yTop = toScreenY(L + epsilon);
        const yBottom = toScreenY(L - epsilon);

        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.fillRect(0, yTop, width, yBottom - yTop);

        ctx.beginPath();
        ctx.strokeStyle = 'green';
        ctx.setLineDash([5, 5]);
        ctx.moveTo(0, yTop);
        ctx.lineTo(width, yTop);
        ctx.moveTo(0, yBottom);
        ctx.lineTo(width, yBottom);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Delta Band (Vertical)
        // x range: [c - delta, c + delta]
        const xLeft = toScreenX(c - delta);
        const xRight = toScreenX(c + delta);

        ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
        ctx.fillRect(xLeft, 0, xRight - xLeft, height);

        ctx.beginPath();
        ctx.strokeStyle = 'blue';
        ctx.setLineDash([5, 5]);
        ctx.moveTo(xLeft, 0);
        ctx.lineTo(xLeft, height);
        ctx.moveTo(xRight, 0);
        ctx.lineTo(xRight, height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Function
        ctx.beginPath();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        for (let px = 0; px < width; px++) {
            const wx = (px - originX) / scaleX;
            const wy = this.f(wx);
            const py = toScreenY(wy);
            if (px === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw Point (c, L)
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.arc(toScreenX(c), toScreenY(L), 4, 0, Math.PI * 2);
        ctx.fill();

        // Check Logic
        // We check if for all x in [c-delta, c+delta], f(x) is in [L-epsilon, L+epsilon]
        // We can discretize the check for simplicity
        let success = true;
        const step = delta / 50;
        for (let x = c - delta; x <= c + delta; x += step) {
            if (Math.abs(x - c) < 0.0001) continue; // skip center
            const val = this.f(x);
            if (Math.abs(val - L) >= epsilon) {
                success = false;
                break;
            }
        }

        const statusEl = document.getElementById('limitStatus');
        if (success) {
            statusEl.textContent = "Status: SUCCESS! The delta box is contained within the epsilon band.";
            statusEl.className = "status-indicator status-success";
        } else {
            statusEl.textContent = "Status: FAIL! The function escapes the epsilon band within your delta range.";
            statusEl.className = "status-indicator status-fail";
        }
    }
};

/**
 * Module 3: Riemann Sums
 * Visualizing integration
 */
const RiemannModule = {
    canvas: null,
    ctx: null,
    width: 600,
    height: 400,
    params: {
        n: 10,
        method: 'left' // left, mid, right
    },

    init() {
        this.canvas = document.getElementById('riemannCanvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.bindEvents();
        this.render();
    },

    bindEvents() {
        const pN = document.getElementById('paramN');
        const radios = document.getElementsByName('riemannMethod');

        pN.addEventListener('input', (e) => {
            this.params.n = parseInt(e.target.value);
            document.getElementById('valN').textContent = this.params.n;
            this.render();
        });

        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.params.method = e.target.value;
                this.render();
            });
        });
    },

    f(x) {
        // f(x) = 0.1x^3 - 0.5x^2 + 2
        // Domain: [-2, 4]
        return 0.1 * Math.pow(x, 3) - 0.5 * Math.pow(x, 2) + 2;
    },

    // Analytical integral for error checking
    integralF(x) {
        // F(x) = 0.025x^4 - 0.166x^3 + 2x
        return 0.025 * Math.pow(x, 4) - (0.5 / 3) * Math.pow(x, 3) + 2 * x;
    },

    render() {
        const { ctx, width, height } = this;
        const { n, method } = this.params;

        ctx.clearRect(0, 0, width, height);

        // Setup coords
        // x: [-2, 5]
        // y: [-1, 6]
        const minX = -2, maxX = 5;
        const minY = -1, maxY = 6;

        const toScreenX = (x) => (x - minX) / (maxX - minX) * width;
        const toScreenY = (y) => height - (y - minY) / (maxY - minY) * height;

        // Draw Axes
        ctx.beginPath();
        ctx.strokeStyle = '#aaa';
        ctx.moveTo(0, toScreenY(0));
        ctx.lineTo(width, toScreenY(0));
        ctx.moveTo(toScreenX(0), 0);
        ctx.lineTo(toScreenX(0), height);
        ctx.stroke();

        // Draw Function
        ctx.beginPath();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        for (let px = 0; px < width; px++) {
            // Inverse map px to x
            const x = (px / width) * (maxX - minX) + minX;
            const y = this.f(x);
            const py = toScreenY(y);
            if (px === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw Rectangles
        // Integrate from a=0 to b=4
        const a = 0, b = 4;
        const dx = (b - a) / n;
        let approxArea = 0;

        ctx.fillStyle = 'rgba(79, 172, 254, 0.3)';
        ctx.strokeStyle = 'rgba(79, 172, 254, 0.8)';
        ctx.lineWidth = 1;

        for (let i = 0; i < n; i++) {
            let x_star;
            const x_left = a + i * dx;
            const x_right = a + (i + 1) * dx;

            if (method === 'left') x_star = x_left;
            else if (method === 'right') x_star = x_right;
            else x_star = (x_left + x_right) / 2;

            const heightVal = this.f(x_star);
            approxArea += heightVal * dx;

            // Draw rect
            const px = toScreenX(x_left);
            const pw = toScreenX(x_right) - px;
            const py = toScreenY(heightVal);
            const ph = toScreenY(0) - py;

            ctx.fillRect(px, py, pw, ph);
            ctx.strokeRect(px, py, pw, ph);
        }

        // Calculate Stats
        const actualArea = this.integralF(b) - this.integralF(a);
        const error = Math.abs(actualArea - approxArea);

        document.getElementById('actualArea').textContent = actualArea.toFixed(4);
        document.getElementById('approxArea').textContent = approxArea.toFixed(4);
        document.getElementById('errorArea').textContent = error.toFixed(4);
    }
};

/**
 * Module 4: Taylor Series
 * Visualizing polynomial approximation
 */
const TaylorModule = {
    canvas: null,
    ctx: null,
    width: 600,
    height: 400,
    params: {
        degree: 1,
        center: 0,
        func: 'sin'
    },

    init() {
        this.canvas = document.getElementById('taylorCanvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.bindEvents();
        this.render();
    },

    bindEvents() {
        const pDeg = document.getElementById('paramDegree');
        const pCen = document.getElementById('paramCenter');
        const pFunc = document.getElementById('taylorFunc');

        pDeg.addEventListener('input', (e) => {
            this.params.degree = parseInt(e.target.value);
            document.getElementById('valDegree').textContent = this.params.degree;
            this.render();
        });

        pCen.addEventListener('input', (e) => {
            this.params.center = parseFloat(e.target.value);
            document.getElementById('valCenter').textContent = this.params.center;
            this.render();
        });

        pFunc.addEventListener('change', (e) => {
            this.params.func = e.target.value;
            this.render();
        });
    },

    // Factorial helper
    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    },

    // Derivatives at x=a
    getDeriv(k, a, type) {
        if (type === 'sin') {
            // sin, cos, -sin, -cos
            const mod = k % 4;
            if (mod === 0) return Math.sin(a);
            if (mod === 1) return Math.cos(a);
            if (mod === 2) return -Math.sin(a);
            if (mod === 3) return -Math.cos(a);
        } else if (type === 'cos') {
            // cos, -sin, -cos, sin
            const mod = k % 4;
            if (mod === 0) return Math.cos(a);
            if (mod === 1) return -Math.sin(a);
            if (mod === 2) return -Math.cos(a);
            if (mod === 3) return Math.sin(a);
        } else if (type === 'exp') {
            return Math.exp(a);
        }
        return 0;
    },

    targetFunc(x, type) {
        if (type === 'sin') return Math.sin(x);
        if (type === 'cos') return Math.cos(x);
        if (type === 'exp') return Math.exp(x);
        return 0;
    },

    taylorPoly(x, n, a, type) {
        let sum = 0;
        for (let k = 0; k <= n; k++) {
            const term = (this.getDeriv(k, a, type) / this.factorial(k)) * Math.pow(x - a, k);
            sum += term;
        }
        return sum;
    },

    render() {
        const { ctx, width, height } = this;
        const { degree, center, func } = this.params;

        ctx.clearRect(0, 0, width, height);

        // Setup coords
        // x: [-10, 10]
        // y: [-5, 5]
        const minX = -8, maxX = 8;
        const minY = -4, maxY = 4;

        const toScreenX = (x) => (x - minX) / (maxX - minX) * width;
        const toScreenY = (y) => height - (y - minY) / (maxY - minY) * height;

        // Draw Axes
        ctx.beginPath();
        ctx.strokeStyle = '#aaa';
        ctx.moveTo(0, toScreenY(0));
        ctx.lineTo(width, toScreenY(0));
        ctx.moveTo(toScreenX(0), 0);
        ctx.lineTo(toScreenX(0), height);
        ctx.stroke();

        // Draw Target Function (Faint)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 3;
        for (let px = 0; px < width; px++) {
            const x = (px / width) * (maxX - minX) + minX;
            const y = this.targetFunc(x, func);
            const py = toScreenY(y);
            if (px === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw Taylor Polynomial
        ctx.beginPath();
        ctx.strokeStyle = '#ff0055'; // Distinct color
        ctx.lineWidth = 2;
        for (let px = 0; px < width; px++) {
            const x = (px / width) * (maxX - minX) + minX;
            const y = this.taylorPoly(x, degree, center, func);

            // Clamp for drawing safety
            if (Math.abs(y) > 100) continue;

            const py = toScreenY(y);
            if (px === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw Center Point
        ctx.beginPath();
        ctx.fillStyle = '#ff0055';
        ctx.arc(toScreenX(center), toScreenY(this.targetFunc(center, func)), 5, 0, Math.PI * 2);
        ctx.fill();
    }
};

// Start
window.addEventListener('load', () => {
    App.init();
});
