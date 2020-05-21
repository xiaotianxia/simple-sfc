window.loadComponent = (function() {
	function fetchAndParse( URL ) {
		return fetch(URL).then( response => {
			return response.text();
		} ).then(html => {
			console.log(html);
			const parser = new DOMParser();
			const document = parser.parseFromString(html, 'text/html');
			const head = document.head;
			const template = head.querySelector('template');
			const style = head.querySelector('style');
			const script = head.querySelector('script');

			return {
				template,
				style,
				script
			};
		});
	}

	function getOptions({ template, style, script }) {
		const jsFile = new Blob([ script.textContent ], { type: 'application/javascript' });
		const jsURL = URL.createObjectURL(jsFile);

		return import(jsURL).then(module => {
			console.log(module);
			return {
				name: module.default.name,
				listeners: module.default.listeners,
				props: module.default.props,
				template,
				style
			}
		} );
	}

	function registerComponent({ template, style, name, listeners, props }) {
		if (!name) {
			console.error('component name is required.');
			return;
		}
		class UnityComponent extends HTMLElement {
			connectedCallback() {
				this._render();
				this._attachListeners();
				console.log(this);
			}

			_render() {
				const shadow = this.attachShadow({ mode: 'open' });

				shadow.appendChild(style.cloneNode( true ));
				console.log(template.content);
				shadow.appendChild(document.importNode(template.content, true));
			}

			_attachListeners() {
				Object.entries(listeners).forEach(([ event, listener ]) => {
					this.addEventListener(event, listener, false);
				} );
			}
		}

		customElements.define(name, UnityComponent);
	}

	function loadComponent(URL) {
		return fetchAndParse(URL).then(getOptions).then(registerComponent);
	}

	return loadComponent;
}());
