# VALIE Portfolio — Pass 123.43

This package is the mobile menu physical-tap reliability pass.

The mobile WORK / ABOUT / REVIEWS / CONTACT rows now navigate from capture-phase pointer/touch activation instead of depending on Android Chrome to synthesize a normal anchor click. The runtime hit-tests the actual row under the finger, closes the menu, updates the section hash, and scrolls to the destination with fixed-header compensation. Normal anchor clicks remain as a fallback for keyboard/mouse input.
