

# adapted from https://stackoverflow.com/a/10029645/2508324
def confidence(ups, downs):
    n = ups + downs

    if n == 0:
        return 0

    z = 1.0
    phat = ups / n
    return (phat + z*z/(2*n) - z * ((phat*(1-phat)+z*z/(4*n))/n)**.5)/(1+z*z/n)
