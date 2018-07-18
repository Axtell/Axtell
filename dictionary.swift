class Dictionary<Key, Value> {
    private class Entry {
        let value: Value
        let nextEntry: Entry?
    }

    private class Bucket {
        let data: Entry[]
        let nextBucket: Bucket?
    }

    private let firstBucket: Bucket
    private let bucketCount: Bucket

    init() => self.init(bucketSize: 24)

    init(bucketSize: Int) {
        self.firstBucket = Bucket(data: [], nextBucket: nil)
        self.bucketCount = 1
    }

    private func store(key: Key, value: Value) {
        let hash: Int = key.hashed()
        Int
    }
}
