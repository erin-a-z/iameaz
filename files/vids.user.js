// ==UserScript==
// @name        Better Video Control
// @namespace   lifauo.com
// @match       *://*.*/*
// @match       https://www.youtube.com/*
// @match       https://www.twitch.tv/*
// @grant       none
// @version     1.3
// @author      lifauo
// @description Grants better control over video playback through shortcuts.
// ==/UserScript==

(function() {
    'use strict';

    // Variable to control whether the script should run
    let isEnabled = true;

    // Default speed increment/decrement
    const STEP_SIZE = 0.1;
    const SCALE_STEP = 0.3; // Scale step size
    const MAX_SCALE = 3; // Maximum scale
    const MIN_SCALE = 0.5; // Minimum scale

    // Function to set the playback speed of all videos and update indicators
    function setPlaybackSpeed(speed) {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.playbackRate = speed;
            updateIndicator(video, speed);
        });
    }

    // Function to scale the video
    function scaleVideo(scale) {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            let currentScale = parseFloat(video.style.transform.match(/scale\(([^)]+)\)/)?.[1]) || 1;
            let newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, currentScale + scale));
            updateTransform(video, newScale, getCurrentRotation(video));
            updateScaleIndicator(video, newScale);
        });
    }

    // Function to rotate the video
    function rotateVideo(angle) {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            let currentRotation = getCurrentRotation(video);
            let newRotation = currentRotation + angle;
            updateTransform(video, getCurrentScale(video), newRotation);
        });
    }

    // Helper function to get the current rotation of the video
    function getCurrentRotation(video) {
        return parseFloat(video.style.transform.match(/rotate\(([^)]+)deg\)/)?.[1]) || 0;
    }

    // Helper function to get the current scale of the video
    function getCurrentScale(video) {
        return parseFloat(video.style.transform.match(/scale\(([^)]+)\)/)?.[1]) || 1;
    }

    // Helper function to update the combined transform
    function updateTransform(video, scale, rotation) {
        video.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    }

    // Function to update the scale indicator on a video element
    function updateScaleIndicator(video, scale) {
        let indicator = video.querySelector('.scale-indicator');

        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'scale-indicator';
            indicator.style.position = 'absolute';
            indicator.style.top = '20px';
            indicator.style.left = '0';
            indicator.style.padding = '5px';
            indicator.style.backgroundColor = '#000';
            indicator.style.color = '#fff';
            indicator.style.borderRadius = '3px';
            indicator.style.fontSize = '14px';
            indicator.style.zIndex = '1000';
            video.style.position = 'relative';
            video.appendChild(indicator);
        }

        indicator.textContent = `Scale: ${scale.toFixed(1)}`;
    }

    // Function to update or create the playback speed indicator on a video element
    function updateIndicator(video, speed) {
        let indicator = video.querySelector('.speed-indicator');

        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'speed-indicator';
            indicator.style.position = 'absolute';
            indicator.style.top = '0';
            indicator.style.left = '0';
            indicator.style.padding = '5px';
            indicator.style.backgroundColor = '#000';
            indicator.style.color = '#fff';
            indicator.style.borderRadius = '3px';
            indicator.style.fontSize = '14px';
            indicator.style.zIndex = '1000';
            video.style.position = 'relative';
            video.appendChild(indicator);
        }

        indicator.textContent = `Speed: ${speed.toFixed(1)}`;
    }

    // Define key bindings and their associated actions
    const keyBindings = {
        '1': () => setPlaybackSpeed(1),
        '2': () => setPlaybackSpeed(2),
        '3': () => setPlaybackSpeed(3),
        '4': () => setPlaybackSpeed(4),
        '5': () => setPlaybackSpeed(5),
        '6': () => setPlaybackSpeed(6),
        '7': () => setPlaybackSpeed(7),
        '8': () => setPlaybackSpeed(8),
        '9': () => setPlaybackSpeed(9),
        '0': () => setPlaybackSpeed(10),
        'q': () => adjustPlaybackSpeed(-STEP_SIZE),
        'w': () => adjustPlaybackSpeed(STEP_SIZE),
        'a': () => scaleVideo(-SCALE_STEP), // Scale down
        's': () => scaleVideo(SCALE_STEP), // Scale up
        'z': () => rotateVideo(-90), // Rotate left
        'x': () => rotateVideo(90) // Rotate right
    };

    // Function to adjust playback speed by a specific step
    function adjustPlaybackSpeed(step) {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            let newSpeed = Math.max(0.1, video.playbackRate + step);
            video.playbackRate = newSpeed;
            updateIndicator(video, newSpeed);
        });
    }

    // Listen for keypress events
    window.addEventListener('keydown', function(event) {
        if (isEnabled) {
            if (keyBindings[event.key]) {
                keyBindings[event.key]();
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }
    }, true);

    function detectVideos() {
        const videos = document.querySelectorAll('video');
        if (videos.length === 0) {
            isEnabled = false;
        } else {
            videos.forEach(video => {
                video.addEventListener('play', () => { isEnabled = true; });
                video.addEventListener('pause', () => { isEnabled = false; });
            });
        }
    }

    document.addEventListener('DOMContentLoaded', detectVideos);
    setInterval(detectVideos, 1000);
})();