/*
The "Spidertron" name and associated images are part of the Factorio game and
are property of Wube Software. The application of this software using the
Spidertron name and image files requires separate permission from Wube Software.

This file, excluding the Spidertron name and images, is subject to the following license:

MIT License

Copyright (c) 2020 Jacob Wirth (xthexder)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const legConnectionCoordinates = [
    {x: 98, y: 62},
    {x: 114, y: 84},
    {x: 120, y: 115},
    {x: 98, y: 142},
    {x: 34, y: 62},
    {x: 18, y: 84},
    {x: 13, y: 115},
    {x: 34, y: 142}
];

const legLengthAdjustment = {
    upperLength: 37,
    lowerLength: 72
}

const zOffsets = {
    ground: 0,
    footUp: 20,
    bodyHeight: 110,
    legJoints: 240
};

const restingLegPositions = [
    {x: 120, y: -130},
    {x: 160, y: -50},
    {x: 160, y: 50},
    {x: 120, y: 130},
    {x: -120, y: -130},
    {x: -160, y: -50},
    {x: -160, y: 50},
    {x: -120, y: 130}
];

const framePeriod = 1000 / 60; // 60 fps
const maxSpidertronSpeed = 150; // Pixels per second
const legStepInterval = 80; // ms
const activeLegCount = 2;
const spidertronScale = 0.5;
const stepRandomness = 30;

const spidertrons = [];

// Sort legs by distance from target and alternate closest/furthest
function sortLegOrder(spidertron) {
    spidertron.legs.sort((a, b) => {
        const aDeltaX = spidertron.targetX - a.currentX;
        const aDeltaY = spidertron.targetY - a.currentY;

        const aDistSquared = aDeltaX * aDeltaX + aDeltaY * aDeltaY;

        const bDeltaX = spidertron.targetX - b.currentX;
        const bDeltaY = spidertron.targetY - b.currentY;

        const bDistSquared = bDeltaX * bDeltaX + bDeltaY * bDeltaY;

        return aDistSquared > bDistSquared;
    });
    spidertron.legs = [
        spidertron.legs[0],
        spidertron.legs[7],
        spidertron.legs[1],
        spidertron.legs[6],
        spidertron.legs[2],
        spidertron.legs[5],
        spidertron.legs[3],
        spidertron.legs[4]
    ];
    spidertron.activeLeg = spidertron.legs.length - 1;
}

function buildSpidertron(baseElement) {
    const spidertron = {
        baseElement: baseElement,
        active: false,
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
        speed: 0,
        activeLeg: 0,
        nextActiveLeg: 0,
        legs: []
    };

     // <div class="spidertron-body-wrapper">
        const spidertronBodyWrapper = document.createElement('div');
        spidertronBodyWrapper.className = 'spidertron-body-wrapper';
        baseElement.appendChild(spidertronBodyWrapper);

        const spidertronBody = document.createElement('div');
        spidertronBody.className = 'spidertron-body';
        spidertronBodyWrapper.appendChild(spidertronBody);

        const spidertronBodyBottom = document.createElement('div');
        spidertronBodyBottom.className = 'spidertron-body-bottom';
        spidertronBodyWrapper.appendChild(spidertronBodyBottom);
    // </div>

    // <div class="spidertron-legN">
    for (let i = 0; i < restingLegPositions.length; i++) {
        const leg = document.createElement('div');
        leg.className = 'spidertron-leg' + (i + 1);
        baseElement.appendChild(leg);
	
        // <div class="spidertron-leg-upper">
            const legUpper = document.createElement('div');
            legUpper.className = 'spidertron-leg-upper';
            leg.appendChild(legUpper);
    
            const legUpperEndA = document.createElement('div');
            legUpperEndA.className = 'spidertron-leg-upper-end-a';
            legUpper.appendChild(legUpperEndA);
    
            const legUpperStretchable = document.createElement('div');
            legUpperStretchable.className = 'spidertron-leg-upper-stretchable';
            legUpper.appendChild(legUpperStretchable);
    
            const legUpperEndB = document.createElement('div');
            legUpperEndB.className = 'spidertron-leg-upper-end-b';
            legUpper.appendChild(legUpperEndB);

            const legKnee = document.createElement('div');
            legKnee.className = 'spidertron-leg-knee';
            legUpper.appendChild(legKnee);

            const lowerLegWrapper = document.createElement('div');
            lowerLegWrapper.className = 'spidertron-leg-lower-wrapper';
            legUpper.appendChild(lowerLegWrapper);
    
            // <div class="spidertron-leg-lower">
                const legLower = document.createElement('div');
                legLower.className = 'spidertron-leg-lower';
                lowerLegWrapper.appendChild(legLower);
        
                const legLowerEndA = document.createElement('div');
                legLowerEndA.className = 'spidertron-leg-lower-end-a';
                legLower.appendChild(legLowerEndA);
        
                const legLowerStretchable = document.createElement('div');
                legLowerStretchable.className = 'spidertron-leg-lower-stretchable';
                legLower.appendChild(legLowerStretchable);
        
                const legLowerEndB = document.createElement('div');
                legLowerEndB.className = 'spidertron-leg-lower-end-b';
                legLower.appendChild(legLowerEndB);
            // </div>
        // </div>

        const legX = restingLegPositions[i].x * spidertronScale + legConnectionCoordinates[i].x + spidertron.currentX;
        const legY = restingLegPositions[i].y * spidertronScale + legConnectionCoordinates[i].y + spidertron.currentY;
        spidertron.legs.push({
            index: i,
            active: false,
            stepTime: 0,
            stepHeight: 0,
            currentX: legX,
            currentY: legY,
            targetX: legX,
            targetY: legY,
            upperElement: legUpper,
            lowerElement: legLower,
            kneeElement: legKnee
        });
    }

    return spidertron;
}

function updateSpidertron(spidertron, time) {
    const targetDeltaX = spidertron.targetX - spidertron.currentX;
    const targetDeltaY = spidertron.targetY - spidertron.currentY;

    // Calculate spidertron speed with an ease-in-out transition
    const targetDistance = Math.round(Math.sqrt(targetDeltaX * targetDeltaX + targetDeltaY * targetDeltaY));
    if (targetDistance > spidertron.speed) {
        spidertron.speed += maxSpidertronSpeed / framePeriod;
    } else {
        spidertron.speed = targetDistance;
    }
    spidertron.speed = Math.max(0, Math.min(spidertron.speed, maxSpidertronSpeed));

    // Move spidertron towards target
    let spidertronDeltaX = 0;
    let spidertronDeltaY = 0;
    if (targetDistance > 0) {
        spidertronDeltaX = targetDeltaX / targetDistance * spidertron.speed / framePeriod;
        spidertronDeltaY = targetDeltaY / targetDistance * spidertron.speed / framePeriod;
        if (Math.abs(spidertronDeltaX) > Math.abs(targetDeltaX)) {
            spidertronDeltaX = targetDeltaX;
        }
        if (Math.abs(spidertronDeltaY) > Math.abs(targetDeltaY)) {
            spidertronDeltaY = targetDeltaY;
        }
        spidertron.currentX += spidertronDeltaX;
        spidertron.currentY += spidertronDeltaY;
    }

    // Update leg target positions
    if (time >= spidertron.nextActiveLeg) {
        spidertron.activeLeg++;
        if (spidertron.activeLeg >= spidertron.legs.length) {
            spidertron.activeLeg = 0;
        }

        spidertron.nextActiveLeg = time + legStepInterval / activeLegCount
        const i = spidertron.activeLeg;

        spidertron.legs[i].active = true;
        spidertron.legs[i].stepTime = time;

        const N = spidertron.legs[i].index;
        if (targetDistance >= maxSpidertronSpeed * spidertronScale) {
            spidertron.legs[i].targetX = restingLegPositions[N].x * spidertronScale + legConnectionCoordinates[N].x + spidertron.currentX;
            spidertron.legs[i].targetY = restingLegPositions[N].y * spidertronScale + legConnectionCoordinates[N].y + spidertron.currentY;
            // Add extrapolated spidertron position
            const msUntilNextStep = legStepInterval / activeLegCount * spidertron.legs.length;
            const deltaScale = (targetDistance > spidertron.speed ? maxSpidertronSpeed : spidertron.speed) / framePeriod / targetDistance / 2;
            spidertron.legs[i].targetX += targetDeltaX * deltaScale * msUntilNextStep / framePeriod;
            spidertron.legs[i].targetY += targetDeltaY * deltaScale * msUntilNextStep / framePeriod;
            // Add some randomness
            spidertron.legs[i].targetX += Math.random() * stepRandomness * spidertronScale;
            spidertron.legs[i].targetY += Math.random() * stepRandomness * spidertronScale;
        } else {
            spidertron.legs[i].targetX = restingLegPositions[N].x * spidertronScale + legConnectionCoordinates[N].x + spidertron.targetX;
            spidertron.legs[i].targetY = restingLegPositions[N].y * spidertronScale + legConnectionCoordinates[N].y + spidertron.targetY;
        }
    }

    for (let i = 0; i < spidertron.legs.length; i++) {
        if (spidertron.legs[i].active) {
            const legDeltaX = spidertron.legs[i].targetX - spidertron.legs[i].currentX;
            const legDeltaY = spidertron.legs[i].targetY - spidertron.legs[i].currentY;
            if ((legDeltaX * legDeltaX + legDeltaY * legDeltaY) > 10) {
                const remainingTime = Math.max(0, spidertron.legs[i].stepTime + legStepInterval - time);
                if (remainingTime > framePeriod) {
                    spidertron.legs[i].currentX += legDeltaX * framePeriod / remainingTime;
                    spidertron.legs[i].currentY += legDeltaY * framePeriod / remainingTime;
                } else {
                    spidertron.legs[i].currentX = spidertron.legs[i].targetX;
                    spidertron.legs[i].currentY = spidertron.legs[i].targetY;
                    spidertron.legs[i].active = false;
                }
            } else {
                spidertron.legs[i].active = false;
            }
        }
    }

    // Update sprites
    spidertron.baseElement.style.setProperty('--spidertron-location-x', spidertron.currentX + 'px');
    spidertron.baseElement.style.setProperty('--spidertron-location-y', spidertron.currentY + 'px');

    const bodyHeight = zOffsets.bodyHeight + Math.sin(time / 130) * 4;
    spidertron.baseElement.style.setProperty('--spidertron-body-height', (-bodyHeight) + 'px');
    spidertron.baseElement.style.setProperty('--spidertron-scale', spidertronScale);

    for (let i = 0; i < spidertron.legs.length; i++) {
        const N = spidertron.legs[i].index;

        let deltaX = (spidertron.legs[i].currentX - legConnectionCoordinates[N].x - spidertron.currentX) / spidertronScale;
        let deltaY = (spidertron.legs[i].currentY - legConnectionCoordinates[N].y - spidertron.currentY) / spidertronScale + bodyHeight;
        if (spidertron.legs[i].active) {
            deltaY -= zOffsets.footUp;
        }
        const upperDeltaX = deltaX / 2;
        const upperDeltaY = deltaY / 2 - (zOffsets.legJoints - zOffsets.bodyHeight);
        const upperLength = Math.sqrt(upperDeltaX * upperDeltaX + upperDeltaY * upperDeltaY);
        const upperAngle = Math.atan2(-upperDeltaX, upperDeltaY);

        const lowerDeltaX = deltaX - upperDeltaX;
        const lowerDeltaY = deltaY - upperDeltaY;
        const lowerLength = Math.sqrt(lowerDeltaX * lowerDeltaX + lowerDeltaY * lowerDeltaY);
        const lowerAngle = Math.atan2(-lowerDeltaX, lowerDeltaY);

        spidertron.legs[i].upperElement.style.setProperty('--leg-upper-angle', upperAngle + 'rad');
        spidertron.legs[i].upperElement.style.setProperty('--leg-upper-length', Math.max(0, upperLength - legLengthAdjustment.upperLength) + 'px');

        spidertron.legs[i].lowerElement.style.setProperty('--leg-lower-angle', (lowerAngle - upperAngle) + 'rad');
        spidertron.legs[i].lowerElement.style.setProperty('--leg-lower-length', Math.max(0, lowerLength - legLengthAdjustment.lowerLength) + 'px');

        spidertron.legs[i].kneeElement.style.setProperty('--knee-angle', -((lowerAngle + upperAngle) / 2) + 'rad');
    }
}

function spidertronAnimationCallback(time) {
    for (let i = 0; i < spidertrons.length; i++) {
        updateSpidertron(spidertrons[i], time);
    }

    window.requestAnimationFrame(spidertronAnimationCallback);
}

let selectedSpidertron = null;

window.onload = function() {
    const maskElement = document.createElement('div');
    maskElement.className = 'spidertron-active-mask';

    const spidertronElements = document.getElementsByClassName('spidertron');
    for (let i = 0; i < spidertronElements.length; i++) {
        const spidertron = buildSpidertron(spidertronElements[i]);
        spidertronElements[i].dataset.spidertronIndex = spidertrons.length;
        updateSpidertron(spidertron, 0);
        spidertrons.push(spidertron);

        spidertronElements[i].addEventListener('click', function(e) {
            const targetSpidertron = spidertrons[e.currentTarget.dataset.spidertronIndex];
            targetSpidertron.active = !targetSpidertron.active;
            if (selectedSpidertron == targetSpidertron) {
                targetSpidertron.targetX = 0;
                targetSpidertron.targetY = 0;
                selectedSpidertron = null;
                document.body.removeChild(maskElement);
            } else {
                targetSpidertron.targetX = targetSpidertron.currentX;
                targetSpidertron.targetY = targetSpidertron.currentY;
                selectedSpidertron = targetSpidertron;
                document.body.appendChild(maskElement);
            }
            e.preventDefault();
        });
    }

    window.requestAnimationFrame(spidertronAnimationCallback);

    maskElement.addEventListener('click', function(e) {
        if (selectedSpidertron != null) {
            const spidertronRect = selectedSpidertron.baseElement.getBoundingClientRect();
            selectedSpidertron.targetX = e.clientX - spidertronRect.left + selectedSpidertron.currentX;
            selectedSpidertron.targetY = e.clientY - spidertronRect.top + selectedSpidertron.currentY;
            sortLegOrder(selectedSpidertron);
            e.preventDefault();
        }
    });
}
