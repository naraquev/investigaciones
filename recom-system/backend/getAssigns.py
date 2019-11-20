import pandas as pd
import numpy as np
import os.path
import sys
from sklearn.model_selection import train_test_split
import itertools

def getAvailableSubjects(studentId):
    studentId = int(studentId)
    # one_hot_path = os.path.abspath('..\\datos\\ordenados\\one_hot.csv')
    # # one_hot_path = os.path.abspath("../datos/modelos/model-5/datos-modificados/fisica_bajo/one_hot_new_classes_fisica_bajo_10085304.csv")
    one_hot_path = os.path.abspath("../datos/CSV/one_hot_new_classes.csv")
    one_hot = pd.read_csv(one_hot_path)
    grouped = one_hot[one_hot['estudiante'] == studentId].sort_values('trimestre').groupby(['estudiante'])
    assigns_trim_target = []
    for est, est_group in grouped:
        for num in range(est_group.shape[0]):
            assigns_trim_target = np.append(assigns_trim_target, est_group.iloc[num, 2:].index[est_group.iloc[num, 2:] == 1].values.tolist(), axis=None)

    assigns_trim_target_aux = []
    for assign in assigns_trim_target:
        # Validacion para no incluir la materia en el array de materias vistas si el estudiante no la ha pasado (reprobado o retirado)
        if (assign.split('_')[1] == "Reprobo" or assign.split('_')[1] == "R"):
            continue
        # Validacion para no incluir como vista la materia Electiva, para que el estudiante pueda elegirla siempre como opcion
        if (assign.split('_')[0] == "FGE0000"):
            continue
        assigns_trim_target_aux = np.append(assigns_trim_target_aux, assign.split('_')[0], axis=None)

    #NUEVO
    seenSubjects = np.asarray(assigns_trim_target_aux)
    path = os.path.abspath('../datos/CSV/subjectNames.csv')
    subjectNames = pd.read_csv(path).sort_values('asignatura')

    # Se obtienen las materias que el estudiante no ha visto
    mask = subjectNames['asignatura'].isin(seenSubjects)
    availableSubjects = subjectNames[~mask]

    # Se llama a la función para transformar las materias disponibles en un array con {code, name}
    total_credits, bp_credits = getCredits(seenSubjects, studentId, False)
    availableSubjectsFormatted = getSubjectsNames(availableSubjects, total_credits, bp_credits)
    return availableSubjectsFormatted

# FUNCTION TO TEST THE BEHAVIOUR AT KNOWN TRIMESTRES (THE LAST ONE OF THE STUDENT)
def getAvailableSubjects_test(studentId):
    studentId = int(studentId)
    # one_hot_path = os.path.abspath('..\\datos\\ordenados\\one_hot.csv')
    one_hot_path = os.path.abspath("../datos/CSV/one_hot_new_classes.csv")
    one_hot = pd.read_csv(one_hot_path)
    grouped = one_hot[one_hot['estudiante'] == studentId].sort_values('trimestre').groupby(['estudiante'])
    assigns_trim_target = []
    for est, est_group in grouped:
        for num in range(est_group.shape[0] - 1):
            assigns_trim_target = np.append(assigns_trim_target, est_group.iloc[num, 2:].index[est_group.iloc[num, 2:] == 1].values.tolist(), axis=None)

    assigns_trim_target_aux = []
    for assign in assigns_trim_target:
        # Validacion para no incluir la materia en el array de materias vistas si el estudiante no la ha pasado (reprobado o retirado)
        if (assign.split('_')[1] == "Reprobo" or assign.split('_')[1] == "R"):
            continue
        # Validacion para no incluir como vista la materia Electiva, para que el estudiante pueda elegirla siempre como opcion
        if (assign.split('_')[0] == "FGE0000"):
            continue
        assigns_trim_target_aux = np.append(assigns_trim_target_aux, assign.split('_')[0], axis=None)

    #NUEVO
    seenSubjects = np.asarray(assigns_trim_target_aux)
    path = os.path.abspath('../datos/CSV/subjectNames.csv')
    subjectNames = pd.read_csv(path).sort_values('asignatura')

    # Se obtienen las materias que el estudiante no ha visto
    mask = subjectNames['asignatura'].isin(seenSubjects)
    availableSubjects = subjectNames[~mask]

    # Se llama a la función para transformar las materias disponibles en un array con {code, name}
    total_credits, bp_credits = getCredits(seenSubjects, studentId, True)
    availableSubjectsFormatted = getSubjectsNames(availableSubjects, total_credits, bp_credits)
    return availableSubjectsFormatted

# Función que recibe un array de las materias que un estudiante no ha visto, 
# y lo devuelve en formato code, name para pasarlo al manejador
def getSubjectsNames(availablesArray, total_credits, bp_credits):
    subjectsArray = []
    for idx, subject in availablesArray.iterrows():
        subject_disabled = False

        if (isinstance(subject.values[8], str)):
            ## CASO ESPECIAL LISTA 5 -> ORDEN: [materia lista siguiente, materia de lista 1]
            if (len(subject.values[8].split(' ')) > 1):

                # Asignaturas que no vio porque empezó en una lista que no las requiere o no hacen falta ver
                if (availablesArray['asignatura'].isin(list(subject.values[8].split(' ')[1])).any() == False): 
                    # Ya vio la materia que le seguia en la lista 1
                    subject_disabled = True
                elif (availablesArray['asignatura'].isin(list(subject.values[8].split(' ')[0])).any() == False): 
                    # Ya vio la materia que le seguir en la siguiente lista
                    subject_disabled = True
            else:
                if (availablesArray['asignatura'].isin(subject.values[8].split(' ')).any() == False): 
                    subject_disabled = True              

        if (isinstance(subject.values[3], str)):

            if (np.isnan(subject.values[6]) == False):
                # Determina si el estudiante no ha visto la materia ni ha cumplido con los creditos bp si aplica
                if (availablesArray['asignatura'].isin(subject.values[3].split(' ')).any() and subject.values[6] > bp_credits):
                    subject_disabled = True
            else:
            	# Determina si no ha visto alguna de las materias preladas para ponerle el disable true
                if (availablesArray['asignatura'].isin(subject.values[3].split(' ')).any()):
                    subject_disabled = True

        # Determina si el estudiante cumple con los requisitos de creditos si los tiene
        if (np.isnan(subject.values[5]) == False):
            if (np.isnan(subject.values[6]) == False):
                if (subject.values[5] > total_credits and subject.values[6] > bp_credits):
                    subject_disabled = True
            else:
                if (subject.values[5] > total_credits):
                    subject_disabled = True

        tmp = {'code':subject.values[1], 'name':subject.values[2], 'disabled': subject_disabled}
        subjectsArray.append(tmp)
    return subjectsArray

def getCredits(seenSubjects, studentId, isTest):
    total_credits = 0
    bp_credits = 0

    notas_path = os.path.abspath("../datos/CSV/notas_new_classes.csv")
    notas = pd.read_csv(notas_path)
    grouped = notas[notas['id'] == studentId].sort_values('trimestre').groupby(['id'])
    assigns_trim_target = []
    for est, est_group in grouped:
        grouped_trim = est_group.groupby(['trimestre'])

        trim_qty = len(est_group['trimestre'].unique())
        counter_trim = 0
        for est_trim, est_group_trim in grouped_trim:
            counter_trim += 1
            if (not isTest):
                if(counter_trim <= trim_qty):
                    for index, subject in est_group_trim.iterrows():
                        if(subject['clasificacion_nota'] != 'R' and subject['clasificacion_nota'] != 'Reprobo' ):
                            total_credits += 1
                            if (subject['asignatura'].find('BP') == 0):
                                bp_credits += 1
            else:
                if(counter_trim < trim_qty):
                    for index, subject in est_group_trim.iterrows():
                        if(subject['clasificacion_nota'] != 'R' and subject['clasificacion_nota'] != 'Reprobo' ):
                            total_credits += 1
                            if (subject['asignatura'].find('BP') == 0):
                                bp_credits += 1
    total_credits *= 3 
    bp_credits *= 3
    return (total_credits, bp_credits)

def createCombinations(availablesArray, preselectedArray, assignsNumber):
    combinations = []
    final_combinations = pd.DataFrame()
    availables = []

    if (assignsNumber != 'all'):
        number = int(assignsNumber) - len(preselectedArray) # Establecer número de materias a evaluar incluyendo las preseleccionadas
        combs = list(itertools.combinations(availablesArray, number))
        # Iterador para insertar las materias preseleccionadas
        if (preselectedArray and len(preselectedArray) > 0):
            new_combs = []
            for c in combs:
                for sel in preselectedArray:            
                    c = c + (sel,) # las combinaciones individuales son objeto 'tuple', así se concatenan
                new_combs.append(c)
            combs = new_combs
        combs = pd.DataFrame(np.asarray(combs))
        final_combinations = pd.concat([final_combinations, combs])
        final_combinations = final_combinations.fillna(value='')
    else:
        numbers = [2,3,4,5,6]

        # Obtener todas las combinaciones posibles de materias, de todas las longitudes posibles
        for number in numbers:
            number = number - len(preselectedArray)
            combs = list(itertools.combinations(availablesArray, number))
            # Iterador para insertar las materias preseleccionadas
            if (preselectedArray and len(preselectedArray) > 0):
                new_combs = []
                for c in combs:
                    for sel in preselectedArray:            
                        c = c + (sel,) # las combinaciones individuales son objeto 'tuple', así se concatenan
                    new_combs.append(c)
                combs = new_combs                
            combs = pd.DataFrame(np.asarray(combs))
            final_combinations = pd.concat([final_combinations, combs])
        final_combinations = final_combinations.fillna(value='')
    return np.asarray(final_combinations)



    