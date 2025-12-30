/**
 * Component Simulation Logic
 * Individual component behaviors (LED, button, sensors, etc.)
 */

import { Component } from './types';

export interface ComponentBehavior {
  onPinChange(pin: string, state: 'HIGH' | 'LOW'): void;
  tick(deltaTime: number): void;
}

export class LEDBehavior implements ComponentBehavior {
  private isOn = false;

  onPinChange(pin: string, state: 'HIGH' | 'LOW'): void {
    this.isOn = state === 'HIGH';
    // TODO: Emit visual update event
  }

  tick(deltaTime: number): void {
    // LEDs are passive, no tick logic
  }

  getState() {
    return { isOn: this.isOn };
  }
}

export class ButtonBehavior implements ComponentBehavior {
  private isPressed = false;

  onPinChange(pin: string, state: 'HIGH' | 'LOW'): void {
    // Buttons are input devices, they drive pins
  }

  tick(deltaTime: number): void {}

  press(): void {
    this.isPressed = true;
    // TODO: Drive connected pin LOW (pulldown)
  }

  release(): void {
    this.isPressed = false;
    // TODO: Drive connected pin HIGH (pullup)
  }
}

// TODO: Implement behaviors for all component types in Phase 1.4
export function createComponentBehavior(component: Component): ComponentBehavior | null {
  switch (component.type) {
    case 'led':
      return new LEDBehavior();
    case 'button':
      return new ButtonBehavior();
    default:
      return null;
  }
}
