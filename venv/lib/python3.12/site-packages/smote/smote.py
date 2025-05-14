import numpy
from sklearn.neighbors import NearestNeighbors


def populate(N, sample, k, neighbors):
    """

    :param N: Number of samples to generate
    :param sample: Sample i
    :param k: Number of neighbors
    :param neighbors: Neighbors array
    :return:
    """
    syn_samples = numpy.zeros((N, sample.shape[1]))
    # 17. while N != 0
    for i in range(N):
        # 18. Choose a random number between 1 and k,callitnn. This step chooses one of the k nearest neighbors of i.
        nn = numpy.random.randint(0, k)
        # 19. for attr = 1 to numattrs
        # Vectorization used
        # 20. Compute: dif = Sample[nnarray[nn]][attr] - Sample[i][attr]
        dif = sample[0] - neighbors[nn]
        # 21. Compute: gap = random number between 0 and 1
        gap = numpy.random.sample(sample.shape[1])
        # 22. Synthetic[newindex][attr] = Sample[i][attr] + gap * dif
        syn_samples[i] = sample[0] + dif*gap
        # 24. newindex++
        # 25. N = N - 1
        # For loop used 24 and 25 not necessary
    return syn_samples


def smote(samples, smote_amount, T, N, k):
    """

    :param samples: Minority samples
    :param smote_amount: SMOTE amount
    :param T: Number of minority samples
    :param N: Value 0 to 100
    :param k: Number of nearest neighbors
    :return: Synthetic samples
    """
    # 1. (* If N is less than 100%, randomize the minority class samples as only a random percent of them will be SMOTEd. *)
    # 2. if N<100
    # 3. then Randomize the T minority class samples
    # 4. T =(N/100) * T
    # 5. N = 100 6.
    # endif
    # TODO: Implement steps 1 through 6
    # In my case I pass 100 so I didn't implement
    # 7. N =(int)(N/100)(* The amount of SMOTE is assumed to be in integral multiples of 100. *)
    # The amount of smote is passed as a parameter - I used "(Full Sample Count - T)/T"
    N = int(N/100) * smote_amount
    # 9. numattrs = Number of attributes
    # 10. Sample[ ][ ]: array for original minority class samples
    # Sample passed as a parameter, numattrs not used since vectorization is utilized: samples.shape[1]
    # 11. newindex: keeps a count of number of synthetic samples generated, initialized to 0
    new_samples = numpy.zeros((T*N, samples.shape[1]))
    # Setup nearest neighbors model
    neigh = NearestNeighbors(k)
    neigh.fit(samples)
    # 13. for i = 1 to T
    for i in range(T):
        # 1 to T 14. Compute k nearest neighbors for i, and save the indices in the nnarray
        k_neighbors = neigh.kneighbors([samples[i]], return_distance=False)
        # Populate(N , i, nnarray)
        syn_samples = populate(N, numpy.array([samples[i]]), k, samples[k_neighbors[0]])
        new_samples[i*N:i*N + N] = syn_samples
    return new_samples