"use strict";

// An order represents a pending push or shift.
const Order = (channel) => {
  let order;
  const preonFulfilleds = [];

  const promise = new Promise((resolve, reject) => {
    order = {
      resolve: (value) => {
        preonFulfilleds.forEach((preonFulfilled) => {
          preonFulfilled(value);
        });

        resolve(value);
      },

      reject,
    };
  });

  return { order, promise };
};

const prototype = {};

// Create a new channel with a buffer the size of "length".
const Channel = function(length = 0) {
  let buffered = 0;
  let closed = false;
  let lastValue;
  const pushes = [];
  const shifts = [];

  const matchPushesAndShifts = (index) => {
    while (index.push < pushes.length && index.shift < shifts.length) {
      const push = pushes[index.push];
      const shift = shifts[index.shift];

      if (push.cancelled) {
        index.push++;
      } else if (shift.cancelled) {
        index.shift++;
      } else {
        lastValue = push.value;
        shift.resolve(lastValue);
        index.shift++;
        push.resolve(length);
        index.push++;
        buffered = Math.max(0, buffered - 1);
      }
    }
  };

  // Resolve push promises up to the end of the buffer.
  const resolveBufferedPushes = (index) => {
    for (
      let resolvedIndex = index.push + buffered;
      resolvedIndex < pushes.length && buffered < length;
      resolvedIndex++
    ) {
      const { cancelled, resolve } = pushes[resolvedIndex];

      if (!cancelled) {
        buffered++;
        resolve(length);
      }
    }
  };

  const resolveClosedShifts = (index) => {
    for (; index.shift < shifts.length; index.shift++) {
      const { cancelled, resolve } = shifts[index.shift];

      if (!cancelled) {
        lastValue = undefined;
        resolve(lastValue);
      }
    }
  };

  // Process the push and shift queues like an order book, looking for matches.
  const processOrders = () => {
    const index = { push: 0, shift: 0 };
    matchPushesAndShifts(index);
    resolveBufferedPushes(index);

    // If the channel is closed then resolve 'undefined' to remaining shifts.
    if (closed) {
      resolveClosedShifts(index);
    }

    pushes.splice(0, index.push);
    shifts.splice(0, index.shift);
  };

  const readOnly = Object.freeze(
    Object.assign(Object.create(prototype), {

      shift: function() {
        const { order, promise } = Order(this);
        shifts.push(order);
        queueMicrotask(processOrders);

        // Don't freeze promise because Bluebird expects it to be mutable.
        return promise;
      },

      toString: () => `Channel(${length})`,

      value: () => lastValue,

      values: async () => {
        const array = [];

        await readOnly.forEach((item) => {
          array.push(item);
        });

        return array;
      },
    })
  );

  const writeOnly = Object.freeze(
    Object.assign(Object.create(prototype), {
      close: () =>
        new Promise((resolve, reject) => {
          if (closed) {
            reject(new Error(`Can't close an already-closed channel.`));
          } else {
            closed = true;
            processOrders();

            // Give remaining orders in flight time to resolve before returning.
            queueMicrotask(resolve);
          }
        }),

      length,

      push: function(value) {
        const { order, promise } = Order(this);
        order.value = value;

        // If value is a promise that rejects, catch it in case there hasn't
        // been a matching shift yet in order to prevent an unhandledRejection
        // error.
        Promise.resolve(value).catch(() => {});

        if (closed) {
          order.reject(new Error(`Can't push to closed channel.`));
        } else if (value === undefined) {
          order.reject(
            new TypeError(
              `Can't push 'undefined' to channel, use close instead.`
            )
          );
        } else if (arguments.length > 1) {
          order.reject(new Error(`Can't push more than one value at a time.`));
        } else {
          pushes.push(order);
          queueMicrotask(processOrders);
        }

        // Don't freeze promise because Bluebird expects it to be mutable.
        return promise;
      },

      writeOnly: () => writeOnly,
    })
  );

  return Object.freeze(
    Object.assign(Object.create(prototype), readOnly, writeOnly)
  );
};

export {Channel}