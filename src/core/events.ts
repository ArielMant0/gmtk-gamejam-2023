export const Events = (function() {

    let ID = 0;

    const _events: Map<String, Array<Object>> = new Map();

    function nextID() {
        return ID++;
    }

    function on(name: String, callback: Function) {
        const id = nextID();
        const obj = { id: id, callback: callback };
        const array = _events.get(name);

        if (!array) {
            _events.set(name, [obj]);
        } else {
            array.push(obj)
            _events.set(name, array);
        }

        return id;
    }

    function off(name: String, handler: Number) {
        const array = _events.get(name);
        if (array) {
            const idx = array.findIndex((d: any) => d.id === handler);
            if (idx >= 0) {
                array.splice(idx, 1);
                _events.set(name, array);
                return true;
            }
        }
        return false;
    }

    function emit(name: String, payload: any) {
        const array = _events.get(name);
        if (array) {
            console.debug("emitting event ", name)
            array.forEach((d: any) => d.callback(payload));
        }
    }

    return  {
        on,
        off,
        emit
    }
}())
