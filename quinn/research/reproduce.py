#!/usr/bin/env python3
"""Public QUINN synthetic oscillator verifier. Python 3 standard library only.

Run from any directory: python3 /path/to/reproduce.py
This verifies byte integrity against a same-site manifest and recomputes the
mathematical demonstration. It does NOT validate a QUINN runtime or a scientific
finding, or authenticate the site author with a trusted third-party key.
"""
import json
import math
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def advance(x, v, dt, coeff, force):
    def derivative(a, b):
        return b, coeff[0] * a + coeff[1] * b + coeff[2] * force
    a = derivative(x, v)
    b = derivative(x + dt * a[0] / 2, v + dt * a[1] / 2)
    c = derivative(x + dt * b[0] / 2, v + dt * b[1] / 2)
    d = derivative(x + dt * c[0], v + dt * c[1])
    return (x + dt * (a[0] + 2*b[0] + 2*c[0] + d[0])/6,
            v + dt * (a[1] + 2*b[1] + 2*c[1] + d[1])/6)


def main():
    catalog = json.loads((ROOT/'catalog.json').read_text())
    assert catalog['schema'] == 'quinn-public-research-catalog/v1'
    meta = catalog['records'][0]
    assert meta['path'] == './data/synthetic-oscillator-001.json'
    binary = (ROOT/'data'/'synthetic-oscillator-001.json').read_bytes()
    digest = hashlib.sha256(binary).hexdigest()
    assert digest == meta['sha256'], 'PUBLISHED CHECKSUM DOES NOT MATCH'
    data = json.loads(binary)
    assert data['schema'] == 'quinn-public-synthetic-oscillator/v1'
    assert data['provenance']['private_runtime_connected'] is False
    assert data['provenance']['external_replication'] is False
    p = data['model']['reference_parameters']
    q = data['model']['candidate_coefficients']
    initial = data['model']['initial_conditions']
    step = data['model']['timestep_seconds']
    assert (p['mass_kg'], p['stiffness_N_m'], p['damping_Ns_m'], step) == (2.,5.,.6,.03)
    expected = data['samples']['rows']
    assert len(expected) == 401
    reference_coeff = [-p['stiffness_N_m']/p['mass_kg'], -p['damping_Ns_m']/p['mass_kg'], 1/p['mass_kg']]
    candidate_coeff = [q['x_coefficient_s2'],q['v_coefficient_s'],q['force_coefficient_kg_inverse']]
    decay = p['damping_Ns_m']/(2*p['mass_kg'])
    wd = math.sqrt(p['stiffness_N_m']/p['mass_kg']-decay**2)
    x_eq = initial['constant_force_N']/p['stiffness_N_m']
    A = initial['x_m']-x_eq
    B = (initial['v_m_s']+decay*A)/wd
    ref_x=can_x=initial['x_m']
    ref_v=can_v=initial['v_m_s']
    maximum_model_mismatch = 0
    maximum_reference_analytic_error = 0
    errors=[]
    for index, sample in enumerate(expected):
        t = index*step
        exact = x_eq+math.exp(-decay*t)*(A*math.cos(wd*t)+B*math.sin(wd*t))
        computed = [t,ref_x,exact,can_x,can_x-ref_x]
        maximum_model_mismatch=max(maximum_model_mismatch,max(abs(x-y) for x,y in zip(sample,computed)))
        maximum_reference_analytic_error=max(maximum_reference_analytic_error,abs(sample[1]-sample[2]))
        errors.append((sample[3]-sample[1])**2)
        ref_x,ref_v=advance(ref_x,ref_v,step,reference_coeff,initial['constant_force_N'])
        can_x,can_v=advance(can_x,can_v,step,candidate_coeff,initial['constant_force_N'])
    rmse = math.sqrt(sum(errors)/len(errors))
    assert maximum_model_mismatch < 5e-10, 'DATA NOT REPRODUCIBLE'
    assert maximum_reference_analytic_error < 2e-6, 'RK4 DOES NOT MATCH INDEPENDENT ANALYTIC SOLUTION'
    assert abs(rmse-data['checks']['rmse_candidate_vs_reference_m'])<5e-10, 'INVALID RMSE'
    print('PASS: SHA-256 byte check against same-site catalog')
    print(f'PASS: all {len(expected)} samples reproduced, max deviation {maximum_model_mismatch:.2e} m')
    print(f'PASS: RK4 reference / independent analytical solution max error {maximum_reference_analytic_error:.2e} m')
    print(f'PASS: candidate vs reference RMSE {rmse:.9f} m')
    print('SCOPE: synthetic math reproduction only; no QUINN runtime or external scientific validation')

if __name__ == '__main__':
    main()
