import Entity from './Entity.js';

export default class Item extends Entity {
	isTargetted() {
		return false;
	}
}
