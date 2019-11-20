import pandas as pd
import numpy as np
import os.path
import sys
from sklearn.model_selection import train_test_split

def adaptX(studentId):
    studentId = int(studentId)

    # UNCOMMENT THE NEXT LINE TO USE THE STUDENTS IN TEST SET
    # one_hot_path = os.path.abspath("../datos/CSV/one_hot_know_test.csv")

    one_hot_path = os.path.abspath("../datos/CSV/one_hot_new_classes.csv")

    one_hot = pd.read_csv(one_hot_path)
    grouped = one_hot[one_hot['estudiante'] == studentId].sort_values('trimestre').groupby(['estudiante'])
    print('grouped', grouped, file=sys.stderr)

    array_data = []

    max_number_trim = 30
    max_number_assigns = 10

    i_estudiante = 0

    for est, est_group in grouped:
        i_estudiante += 1
        
        count = 0
        
        count += 1
        
        row_trim = []

        for num_empty in range(max_number_trim): #Se agarran todos los trimestres
            row_trim.append(np.zeros((264), dtype=int))

        start_trim = max_number_trim - est_group.shape[0]

        for num in range(est_group.shape[0]): #Aquí es cuando se ponen los valores en los trimestres.
            row_trim[start_trim + num ] = est_group.iloc[ num , 3:].values
        array_data.append(np.asarray(row_trim))

    return np.asarray(array_data)

# FUNCTION TO TEST THE BEHAVIOUR AT KNOWN TRIMESTRES (THE LAST ONE OF THE STUDENT)
def adaptX_test(studentId):
    studentId = int(studentId)

    # UNCOMMENT THE NEXT LINE TO USE THE STUDENTS IN TEST SET
    # one_hot_path = os.path.abspath("../datos/CSV/one_hot_know_test.csv")

    one_hot_path = os.path.abspath("../datos/CSV/one_hot_new_classes.csv")

    one_hot = pd.read_csv(one_hot_path)
    grouped = one_hot[one_hot['estudiante'] == studentId].sort_values('trimestre').groupby(['estudiante'])
    
    array_data = []

    max_number_trim = 30
    max_number_assigns = 10
    
    i_estudiante = 0
    

    for est, est_group in grouped:
        i_estudiante += 1
        
        count = 0
        
        count += 1
        
        row_trim = []

        for num_empty in range(max_number_trim): #Se agarran todos los trimestres
            row_trim.append(np.zeros((264), dtype=int))

        start_trim = max_number_trim - est_group.shape[0] + 1
        
        for num in range(est_group.shape[0] - 1): #Aquí es cuando se ponen los valores en los trimestres.
            row_trim[start_trim + num ] = est_group.iloc[ num , 3:].values
        array_data.append(np.asarray(row_trim))

    return np.asarray(array_data)
