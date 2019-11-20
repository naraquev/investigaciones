import pandas as pd
import numpy as np
import os.path
import sys
from sklearn.model_selection import train_test_split

def adapty(assigns_trim_target):
  array_target = []

  all_assigns = ['FBTCE03','FBTMM00','FBTHU01','FBTIE02','BPTQI21','BPTMI04','FBPIN01'
  ,'BPTPI07','FBPLI02','FBTIN04','FGE0000','FBPCE04','FBPMM02','FBTIN05'
  ,'FBPIN03','FBPIN02','FBPLI01','FBPCE03','FBPMM01','FBTHU02','FBTSP03'
  ,'BPTFI02','BPTMI11','BPTSP05','BPTMI01','FBTCE04','FBTMM01','FGS0000'
  ,'FBTIE03','BPTFI03','BPTMI20','BPTFI01','BPTQI22','BPTMI05','BPTMI30'
  ,'BPTSP06','BPTMI02','BPTMI03','FPTCS16','FPTSP15','BPTEN12','BPTMI31'
  ,'FPTEN23','BPTSP03','BPTFI04','FPTSP14','BPTDI01-1','FBTIE01','FPTSP20'
  ,'FPTMI21','BPTSP04','FPTSP01','FPTSP18','FPTSP22','FPTSP17','FPTPI09'
  ,'FPTSP11','FPTSP04','FPTSP02','BPTDI01-2','FPTSP23','FPTSP19','FPTSP07'
  ,'FPTSP25','FPTSP21','FPTIS01']

  all_assigns.sort()

  only_assigns = {}
  for assign_zero in all_assigns:
    only_assigns[assign_zero] = 0
    
  for assign in assigns_trim_target:
    only_assigns[assign] = 1
    
  array_target.append(np.array( tuple(only_assigns.values()) ))
  return np.asarray(array_target)

def getContextAndTarget(array_target, array_data):
  new_array_historial = []
  new_array_target_mat = []
  new_array_target_context = []
  for materia in range(array_target.shape[1]):
    # Comprobacion de que la materia este vacia, para sartarla
    if(np.array_equal(array_target[0][materia], np.zeros((66)))):
      continue
    mat_target = [array_target[0][materia]]
    context_target = np.delete(array_target[0], materia, 0)

    new_array_target_mat.append(mat_target)
    new_array_target_context.append(context_target)
    new_array_historial.append(array_data[0])

  return np.asarray(new_array_historial), np.asarray(new_array_target_mat), np.asarray(new_array_target_context)


def adaptYModel5(assigns_trim_target, array_data):
  array_target = []
  new_array_data = []
  max_number_trim = len(assigns_trim_target)
  
  all_assigns = ['FBTCE03','FBTMM00','FBTHU01','FBTIE02','BPTQI21','BPTMI04','FBPIN01'
  ,'BPTPI07','FBPLI02','FBTIN04','FGE0000','FBPCE04','FBPMM02','FBTIN05'
  ,'FBPIN03','FBPIN02','FBPLI01','FBPCE03','FBPMM01','FBTHU02','FBTSP03'
  ,'BPTFI02','BPTMI11','BPTSP05','BPTMI01','FBTCE04','FBTMM01','FGS0000'
  ,'FBTIE03','BPTFI03','BPTMI20','BPTFI01','BPTQI22','BPTMI05','BPTMI30'
  ,'BPTSP06','BPTMI02','BPTMI03','FPTCS16','FPTSP15','BPTEN12','BPTMI31'
  ,'FPTEN23','BPTSP03','BPTFI04','FPTSP14','BPTDI01-1','FBTIE01','FPTSP20'
  ,'FPTMI21','BPTSP04','FPTSP01','FPTSP18','FPTSP22','FPTSP17','FPTPI09'
  ,'FPTSP11','FPTSP04','FPTSP02','BPTDI01-2','FPTSP23','FPTSP19','FPTSP07'
  ,'FPTSP25','FPTSP21','FPTIS01']

  all_assigns.sort()
  
  # Rellenar todos los espacios de materias target en 0 

  # Se itera sobre cada posible trimestre
  for idx, trim in enumerate(assigns_trim_target):
    # Se llena la fila que va dentro de cada fila de row_assigns
    only_assigns = {}
    
    for assign_zero in all_assigns:
      only_assigns[assign_zero] = 0
    
    for assign in trim:
      if (assign != ''):
        only_assigns[assign] = 1
    
    array_target.append(np.array( tuple(only_assigns.values()) ))
    new_array_data.append(array_data[0])
  return np.asarray(array_target), np.asarray(new_array_data)

