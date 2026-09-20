(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (motionPreference.matches || !window.HTMLCanvasElement) {
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.id = "petal-rain";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    const context = canvas.getContext("2d");
    const colors = [
        "rgba(255, 183, 197, 0.72)",
        "rgba(255, 205, 214, 0.68)",
        "rgba(255, 226, 232, 0.76)",
        "rgba(244, 166, 187, 0.62)",
    ];

    let width = 0;
    let height = 0;
    let density = 0;
    let petals = [];
    let frameId = 0;
    let previousTime = performance.now();

    const createPetal = (initial = false) => ({
        x: Math.random() * width,
        y: initial ? Math.random() * height : -20 - Math.random() * height * 0.2,
        size: 5 + Math.random() * 7,
        speed: 22 + Math.random() * 24,
        drift: 10 + Math.random() * 18,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.8 + Math.random() * 1.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 1.6,
        squash: 0.45 + Math.random() * 0.35,
        color: colors[Math.floor(Math.random() * colors.length)],
    });

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;

        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(width * pixelRatio);
        canvas.height = Math.floor(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        density = width < 640
            ? 12
            : Math.min(30, Math.max(18, Math.floor(width / 55)));

        while (petals.length < density) {
            petals.push(createPetal(true));
        }

        if (petals.length > density) {
            petals = petals.slice(0, density);
        }
    };

    const drawPetal = (petal) => {
        context.save();
        context.translate(petal.x, petal.y);
        context.rotate(petal.rotation);
        context.scale(1, petal.squash);
        context.fillStyle = petal.color;
        context.beginPath();
        context.moveTo(0, -petal.size);
        context.bezierCurveTo(
            petal.size * 0.85,
            -petal.size * 0.35,
            petal.size * 0.72,
            petal.size * 0.65,
            0,
            petal.size
        );
        context.bezierCurveTo(
            -petal.size * 0.72,
            petal.size * 0.65,
            -petal.size * 0.85,
            -petal.size * 0.35,
            0,
            -petal.size
        );
        context.fill();
        context.restore();
    };

    const animate = (time) => {
        const elapsed = Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;
        context.clearRect(0, 0, width, height);

        petals.forEach((petal, index) => {
            petal.phase += petal.phaseSpeed * elapsed;
            petal.x += Math.sin(petal.phase) * petal.drift * elapsed;
            petal.y += petal.speed * elapsed;
            petal.rotation += petal.rotationSpeed * elapsed;

            if (petal.y > height + petal.size * 2 || petal.x < -40 || petal.x > width + 40) {
                petals[index] = createPetal();
            } else {
                drawPetal(petal);
            }
        });

        frameId = window.requestAnimationFrame(animate);
    };

    const start = () => {
        if (!frameId) {
            previousTime = performance.now();
            frameId = window.requestAnimationFrame(animate);
        }
    };

    const stop = () => {
        if (frameId) {
            window.cancelAnimationFrame(frameId);
            frameId = 0;
        }
    };

    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    });

    motionPreference.addEventListener("change", (event) => {
        if (event.matches) {
            stop();
            canvas.remove();
        }
    });

    resize();
    start();
})();
