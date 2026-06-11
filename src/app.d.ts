declare global {
	var __APP_VERSION__: string;

	namespace App {
		interface Locals {
			selectedVault?: string;
			lang?: string;
		}
	}
}

export {};
