/**
 * Proof Mutex / Queue Service
 * Ensures only ONE zero-knowledge proof generation task runs at a time,
 * preventing memory spikes on memory-constrained containers like Railway.
 */

class ProofQueue {
    constructor() {
        this.queue = [];
        this.running = false;
    }

    async run(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.running || this.queue.length === 0) return;

        this.running = true;
        const { task, resolve, reject } = this.queue.shift();

        try {
            const result = await task();
            resolve(result);
        } catch (err) {
            reject(err);
        } finally {
            this.running = false;
            // Free memory if garbage collector is exposed
            if (global.gc) {
                try { global.gc(); } catch (e) {}
            }
            this.process();
        }
    }
}

const proofQueue = new ProofQueue();

module.exports = proofQueue;
